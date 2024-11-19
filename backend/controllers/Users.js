'use strict';

var utils = require('../utils/writer.js');
var Users = require('../service/UsersService.js');
const api = require('../utils/apiUtils.js');
const { response } = require('express');

module.exports.add_liked_song = function add_liked_song (req, res, next, body, userId) {
  Users.add_liked_song(body, userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.create_user_playlist = function create_user_playlist (req, res, next, body, userId) {
  Users.create_user_playlist(body, userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.delete_playlist_by_id = function delete_playlist_by_id (req, res, next, userId, playlistId) {
  Users.delete_playlist_by_id(userId, playlistId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.delete_user_playlist = function delete_user_playlist (req, res, next, userId, playlistId) {
  Users.delete_user_playlist(userId, playlistId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.follow_artist = function follow_artist (req, res, next, body, userId) {
  Users.follow_artist(body, userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.get_liked_songs = function get_liked_songs (req, res, next, userId) {
  Users.get_liked_songs(userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.get_playlist_by_id = function get_playlist_by_id (req, res, next, userId, playlistId) {
  Users.get_playlist_by_id(userId, playlistId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.get_recommended_songs = function get_recommended_songs (req, res, next, userId) {
  Users.get_recommended_songs(userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.get_user_followed_artists = function get_user_followed_artists (req, res, next, userId) {
  Users.get_user_followed_artists(userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.get_user_playlists = function get_user_playlists (req, res, next, userId) {
  Users.get_user_playlists(userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.login_user = async function login_user(req, res) {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return api.errorResponse(res, 'Username and password are required', 400);
  }

  try {
    const response = await Users.login_user(username, password);

    // Set session for the user
    req.session.user = {
      id: response.userId,
      username: response.username,
    };

    console.log(`User logged in: ${response.username}`);
    return api.successResponse(res, 'Login successful', { token: response.token });
  } catch (error) {
    console.error(`Login failed for ${username}: ${error.details || error.message}`);
    const statusCode = error.code || 500;
    return api.errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller to handle user logout
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.logout_user = async function logout_user(req, res) {
  const response = await Users.logout_user(req.body);
  try {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
      if (err) {
        return api.errorResponse(
          res,
          'Failed to log out',
          500
        );
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      return api.successResponse(
        res,
        'Logout successful',
        { username: response.username }
      );
    });
  } catch (error) {
    console.error(`Logout failed: ${error.message}`);
    return api.errorResponse(
      res,
      'Internal server error',
      500
    );
  }
};


/**
 * Registers a new user by calling the user service with the provided request body data.
 * 
 * @function register_user
 * @param {Object} req - The request object, containing user data in `req.body`.
 * @param {Object} res - The response object used to send success or error responses.
 * 
 * @returns {Object} JSON response indicating success or error of user registration.
 */
module.exports.register_user = async function register_user(req, res) {
  const { username, password, email } = req.body;

  // Validate request body
  if (!username || !password || !email) {
    return api.errorResponse(res, 'Missing required fields: username, password, or email', 400);
  }

  try {
    const response = await Users.register_user(req.body);

    console.log(`User registered: ${response.body.username}`);
    return api.successResponse(res, response.message, response.body, 201);
  } catch (error) {
    console.error(`Registration failed for user ${username}: ${error.details || error.message}`);
    const statusCode = error.code || 500;
    return api.errorResponse(res, error.message, statusCode);
  }
};


module.exports.remove_liked_song = function remove_liked_song (req, res, next, userId, songId) {
  Users.remove_liked_song(userId, songId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.unfollow_artist = function unfollow_artist (req, res, next, userId, artist_id) {
  Users.unfollow_artist(userId, artist_id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.update_playlist_by_id = function update_playlist_by_id (req, res, next, body, userId, playlistId) {
  Users.update_playlist_by_id(body, userId, playlistId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
