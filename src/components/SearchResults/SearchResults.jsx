import React from "react";

import "./SearchResult.css";

import TrackList from "../Tracklist/TrackList";

const SearchResults = (props) => {
  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <TrackList tracks={props.searchResults} onAdd={props.onAdd} />
    </div>
  );
};

export default SearchResults;
