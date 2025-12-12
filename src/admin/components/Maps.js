import React from 'react';
import '../styles/maps.css';

export default function Maps(){
  return (
    <section className="maps-pulse">
      <h2 className="maps-pulse__title">Maps</h2>
      <div className="maps-pulse__grid">
        <div className="maps-pulse__tile">Map A</div>
        <div className="maps-pulse__tile">Map B</div>
        <div className="maps-pulse__tile">Map C</div>
      </div>
    </section>
  );
}
