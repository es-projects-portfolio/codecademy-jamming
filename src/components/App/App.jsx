import React, { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import "./App.css";
import Playlist from "../Playlist/Playlist.jsx";
import SearchBar from "../SeacrhBar/SearchBar.jsx";
import SearchResults from "../SearchResults/SearchResults.jsx";
import UserPlaylists from "../UserPlaylists/UserPlaylists.jsx";
import {Spotify} from "../../utils/Spotify.js";

const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = useCallback(() => {
    Spotify.getUserPlaylists()
      .then((playlists) => {
        setUserPlaylists(playlists);
      })
      .catch((error) => {
        console.error("Error fetching user playlists: ", error);
      });
  }, []);

  const search = useCallback((term) => {
    Spotify.search(term).then(setSearchResults);
  }, []);

  const addTrack = useCallback((track) => {
    if (!playlistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      setPlaylistTracks((prevTracks) => [...prevTracks, track]);
    }
  }, [playlistTracks]);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((currentTrack) => currentTrack.id !== track.id)
    );
  }, []);

  const updatePlaylistName = useCallback((name) => {
    setPlaylistName(name);
  }, []);

  const savePlaylist = useCallback(() => {
    if (!playlistName || !playlistTracks.length) {
      return;
    }

    const trackURIs = playlistTracks.map((track) => track.uri);
    const existingPlaylist = userPlaylists.find((playlist) => playlist.name === playlistName);

    if (existingPlaylist) {
      const playlistId = existingPlaylist.id;
      const accessToken = Spotify.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };

      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: trackURIs }),
      })
        .then(() => {
          toast.success("Playlist successfully updated.", {
            className: 'custom-toast',
            progressClassName: 'custom-progress-bar',
          });
        })
        .catch((error) => {
          console.error("Error updating playlist:", error);
        })
    } else {
      Spotify.savePlaylist(playlistName, trackURIs)
        .then((newPlaylist) => {
          toast.success("New playlist successfully saved." , {
            className: 'custom-toast',
            progressClassName: 'custom-progress-bar',
          });
          setUserPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);
          fetchUserPlaylists();
        })
        .catch((error) => {
          console.error("Error saving new playlist:", error);
        });
    }
  }, [playlistName, playlistTracks, userPlaylists]);

  const selectPlaylist = (selectedPlaylist) => {
    setPlaylistName(selectedPlaylist.name);
    setPlaylistTracks(selectedPlaylist.tracks);
  };

  const createNewPlaylist = () => {
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
  };

  return (
    <div>
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <ToastContainer />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onRemove={removeTrack}
            onSave={savePlaylist}
          />
          <UserPlaylists
            playlists={userPlaylists}
            onSelect={selectPlaylist}
            onCreateNewPlaylist={createNewPlaylist}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
