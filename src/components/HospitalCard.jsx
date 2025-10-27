import React from 'react';


const HospitalCard = ({ hospital, isCurrentlyContacting }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 transition-all duration-300 shadow-lg ${isCurrentlyContacting ? 'ring-4 ring-blue-500 scale-105' : 'ring-2 ring-white/20'}`}>
      <div className="flex flex-col h-full">
        <h4 className="text-xl font-bold text-white mb-2">{hospital.name}</h4>
        <p className="text-gray-300 mb-1 flex-grow">{hospital.address}</p>
        {typeof hospital.distanceMeters === 'number' && (
          <p className="text-gray-400 text-sm mb-4">{(hospital.distanceMeters / 1000).toFixed(2)} km away</p>
        )}
        <p className="text-gray-200 font-semibold mb-6">
          <a href={`tel:${hospital.phone}`} className="hover:underline">{hospital.phone}</a>
        </p>
        
        {isCurrentlyContacting && (
           <div className="text-center bg-blue-500/20 text-blue-200 py-1 px-3 rounded-md mb-4 text-sm font-semibold">
             Contacting...
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`tel:${hospital.phone}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md"
          >
            Call Now
          </a>
          <a
            href={hospital.location ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + (hospital.address || ''))}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md"
          >
            Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;