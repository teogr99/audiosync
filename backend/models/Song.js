class Song {
  /**
   * Song - A model representing a song in the system.
   *
   * @param {number} id - Unique identifier for the song.
   * @param {string} title - Title or name of the song.
   * @param {number} artist_id - ID of the artist who created the song.
   * @param {string} artist - Name of the artist who created the song.
   * @param {string} album - Name of the album containing the song.
   * @param {number} duration - Duration of the song in seconds.
   * @param {string} cover - Album cover image URL associated with the song.
   * @param {boolean} liked - Flag indicating if the user has liked the song.
   * @param {Array} playlists - List of playlists the song belongs to.
   * @param {boolean} isPlaying - Boolean flag indicating if the song is currently playing.
   */
  constructor(
    id = null,
    title = null,
    artist_id = null,
    artist = null,
    audio_url = null,
    album = null,
    duration = null,
    cover = null,
    liked = null,
    playlists = [],
    isPlaying = null
  ) {
    this._id = id;
    this._title = title;
    this._artist_id = artist_id;
    this._artist = artist;
    this._audio_url = audio_url;
    this._album = album;
    this._duration = duration;
    this._cover = cover;
    this._liked = liked;
    this._playlists = playlists;
    this._isPlaying = isPlaying;
  }

  static fromObject(data) {
    return new Song(
      data.id,
      data.title,
      data.artist_id,
      data.artist,
      data.audio_url,
      data.album,
      data.duration,
      data.cover,
      data.liked,
      data.playlists,
      data.isPlaying
    );
  }

  /**
   * Converts the Song instance to a plain JavaScript object.
   * @returns {Object} A JSON-friendly representation of the song.
   */
  toJSON() {
    return {
      id: this.id,
      title: this._title,
      artist_id: this._artist_id,
      artist: this._artist,
      audio_url: this._audio_url,
      album: this._album,
      duration: this._duration,
      cover: this._cover,
      liked: this._liked,
      playlists: this._playlists,
      isPlaying: this._isPlaying,
    };
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    this._title = value;
  }

  get artist_id() {
    return this._artist_id;
  }

  set artist_id(value) {
    this._artist_id = value;
  }

  get audio_url() {
    return this._audio_url;
  }

  set audio_url(value) {
    this._audio_url = value;
  }


  get artist() {
    return this._artist;
  }

  set artist(value) {
    this._artist = value;
  }

  get album() {
    return this._album;
  }

  set album(value) {
    this._album = value;
  }

  get duration() {
    return this._duration;
  }

  set duration(value) {
    this._duration = value;
  }

  get cover() {
    return this._cover;
  }

  set cover(value) {
    this._cover = value;
  }

  get liked() {
    return this._liked;
  }

  set liked(value) {
    this._liked = value;
  }

  get playlists() {
    return this._playlists;
  }

  set playlists(value) {
    this._playlists = value;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  set isPlaying(value) {
    this._isPlaying = value;
  }
}

module.exports = Song;