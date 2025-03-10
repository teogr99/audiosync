'use strict';

const db = require('../utils/dbUtils');
const spotify = require('../utils/spotify');

/**
 * Get details of a specific playlist
 * Retrieve details of a specific playlist created by a user
 *
 * userId Integer ID of the user who owns the playlist
 * playlistId Integer ID of the playlist to fetch details for
 * returns Playlist
 **/
exports.get_playlist_by_id = async function(userId,playlistId) {
    const connection = db.createConnection();
    try {
        const selectQuery = `
             SELECT
                playlists.id AS playlist_id,
                playlists.title AS playlist_title,
                playlists.cover AS playlist_cover,
                playlists.created_at,
                playlists.updated_at,
                songs.id AS song_id,
                playlists.isLikedSongs,
                songs.title AS song_title,
                songs.album AS song_album,
                songs.cover AS song_cover,
                artists.name AS artist_name,
                playlist_songs.order AS song_order
            FROM playlists
            LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id -- LEFT JOIN in case there arent any songs in the playlist
            LEFT JOIN songs ON playlist_songs.song_id = songs.id
            LEFT JOIN artists ON songs.artist_id = artists.id
            WHERE playlists.id = ? AND playlists.owner = ?
            ORDER BY playlist_songs.order
        `;
        const selectResult = await db.executeQuery(connection, selectQuery, [playlistId, userId]);
      //   console.log(selectResult);
        if (selectResult.length > 0) {
            const playlistData = {
                id: selectResult[0].playlist_id,
                title: selectResult[0].playlist_title,
                cover: selectResult[0].playlist_cover,
                created_at: selectResult[0].created_at,
                updated_at: selectResult[0].updated_at,
                isLikedSongs: selectResult[0].isLikedSongs,
                songs: []
            };
            
            // Add songs to the paylist with their covers
            const songs = await Promise.all(
              selectResult.map(async (row) => {
                if (row.song_id) {
                  let album_cover = row.song_cover; // Cover is included in the query
                  if (!album_cover) {
                    try {
                      console.log(`Cover missing for album: ${row.song_album}. Fetching from Spotify...`);
                      album_cover = await spotify.getSongCover(row.song_album);
            
                      if (album_cover) {
                        // Update the cover in the database
                        const updateCoverQuery = `
                          UPDATE songs
                          SET cover = ?
                          WHERE id = ?
                        `;
                        await db.executeQuery(connection, updateCoverQuery, [album_cover, row.song_id]);
                      } else {
                        console.warn(`Failed to fetch cover for album: ${row.song_album}`);
                      }
                    } catch (error) {
                      console.error(`Failed to fetch album cover for song: ${error}`);
                    }
                  }
            
                  return {
                    id: row.song_id,
                    title: row.song_title,
                    artist: row.artist_name,
                    order: row.song_order,
                    album: row.song_album,
                    cover: album_cover
                  };
                }
            
                return null;
              })
            );
            // Filter out null values from songs array
            playlistData.songs = songs.filter(song => song !== null);
            return {
                message: "Playlist retrieved successfully",
                body: playlistData
            };
        } else {
            throw {
                message: 'Playlist not found',
                code: 404
            };
        }
    } catch(error) {
        console.error(`Error fetching playlist: ${error}`);
        if (error.code) throw error; // Re-throw expected errors without modification

        throw {
            message: "Unexpected error fetching playlist",
            code: 500
        };
    } finally {
        db.closeConnection(connection);
    }
};

/**
 * Update details of a specific playlist
 * Update details of a specific playlist owned by a user
 *
 * body Playlist Updated playlist object
 * userId Integer ID of the user who owns the playlist
 * playlistId Integer ID of the playlist to update
 * no response value expected for this operation
 **/
exports.update_playlist_by_id = async function(body,userId,playlistId) {
  const connection = db.createConnection();
  try {
      const updatePlaylistQuery = `
          UPDATE playlists
          SET title = ?, cover = ?, updated_at = NOW()
          WHERE id = ? AND owner = ?
      `;
      // Escaping the reserved sql keyword here
      const updateSongsQuery = `
          INSERT INTO playlist_songs (playlist_id, song_id, \`order\`) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE \`order\` = VALUES(\`order\`)
      `;
      const { title, cover, songs } = body;
      // Start a transaction
      await db.beginTransaction(connection);
      // Step 1: Update the playlist's details
      const playlistUpdateResult = await db.executeQuery(connection, updatePlaylistQuery, [title, cover, playlistId, userId]);
      if (playlistUpdateResult.affectedRows === 0) {
          // If nothing got affected something went wrong / playlist not found / bad owner
          throw {
              message: 'Playlist not found or unauthorized',
              code: 404
          };
      }
      // Step 2: Update playlist songs 
      for(const song of songs) {
          await db.executeQuery(connection, updateSongsQuery, [playlistId, song.id, song.order]);
      }
      // Commit transaction
      await db.commitTransaction(connection);
      return {
          message: 'Playlist updated successfully',
      };
  } catch (error) {
      console.error(`Error updating playlist: ${error}`);
      await db.rollbackTransaction(connection);
      if (error.code) throw error; // Re-throw expected errors without modification

      throw {
          message: "Unexpected error updating playlist",
          code: 500,
      };
  } finally {
      db.closeConnection(connection);
  }
};



/**
 * Delete a specific playlist
 * Delete a specific playlist created by a user
 *
 * userId Integer ID of the user who owns the playlist
 * playlistId Integer ID of the playlist to delete
 * no response value expected for this operation
 **/
exports.delete_playlist_by_id = async function(userId,playlistId) {
      const connection = db.createConnection();
      try {
          await db.beginTransaction(connection);
          // Step 1: Delete asociated songs off playlist
          const deletePlaylistSongsQuery = `
              DELETE FROM playlist_songs
              WHERE playlist_id = ?;
          `;
          await db.executeQuery(connection, deletePlaylistSongsQuery, [playlistId]);
          // Step 2: Delete playlist
          const deletePlaylistQuery = `
              DELETE FROM playlists
              WHERE id = ? AND owner = ?;
          `;
          const deletePlaylistResult = await db.executeQuery(connection, deletePlaylistQuery, [playlistId, userId]);
          if (deletePlaylistResult.affectedRows > 0) {
              // Commit transaction
              await db.commitTransaction(connection);
              return {
                  message: 'Playlist deleted successfully',
                  code: 204
              };
          } else {
              // If no rows affected rollback
              await db.rollbackTransaction(connection);
              
              throw {
                  message: 'Playist not found or unauthorized',
                  code: 404
              };
          }
      } catch (error) {
          console.error(`Error deleting playist: ${error}`);
          db.rollbackTransaction(connection);
          if (error.code) throw error; // Re-throw expected errors without modification

          throw {
              message: `Unexpected error deleting playlist`,
              code: 500
          };
      } finally {
          db.closeConnection(connection);
      }
  };

  

