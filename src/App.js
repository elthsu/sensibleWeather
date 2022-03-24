import { useState, useRef, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import './App.css';

const PLACES = [
  {id: 'Snowmass, CO', lat: 39.2130, lng: -106.9378},
  {id: 'Malibu, CA', lat: 34.0259, lng: -118.7798},
  {id: 'Catskill, NY', lat: 42.2146, lng: -73.9595},
  {id: 'Grand Teton National Park, WY', lat: 43.7904, lng: -110.6818},
  {id: 'Columbia River Gorge, OR', lat: 45.7253, lng: -121.7300}
]

const Marker = ({ label, onClick }) => <div onClick={onClick} style={{color: "#fff", height: "50px", width: "100px", backgroundColor: "red", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center"}}>{label}</div>;


function App (props) {
  const searchRef = useRef(null)
  const radiusRef = useRef(null)

  const mapRef = useRef(null)
  const mapsRef = useRef(null)

  const [ loading, setLoading ] = useState(true)
  const [ center, setCenter ] = useState({lat: 39.2130, lng: -106.9378})
  const [ active, setActive] = useState(0);
  const [ search, setSearch ] = useState("")
  const [ radius, setRadius ] = useState("500")
  const [ resultsArr, setResultsArr ] = useState([])

  const placesArr = PLACES
    .map(place => {
      return (
        <Marker
          onClick={()=>setCenter({lat: place.lat, lng: place.lng})}
          key={place.id}
          lat={place.lat}
          lng={place.lng}
          label={place.id}
        />
      );
    });

  const handleRadioClick = (placeId) => {
    let clickedPlace = PLACES.filter(filterItem => filterItem.id === placeId)
    setCenter({
      lat: clickedPlace[0].lat,
      lng: clickedPlace[0].lng
    })
  }

  const handleSearch = async () => {
    setLoading(true)
    let service = await new mapsRef.current.places.PlacesService(mapRef.current);
    let location = await new mapsRef.current.LatLng(center.lat, center.lng)
    function callback(results, status) {
      if (status === mapsRef.current.places.PlacesServiceStatus.OK) {
        setResultsArr(results)
      }
      else if (status === "ZERO_RESULTS"){
        setResultsArr([])
      }
      setLoading(false)
    }
    service.textSearch({
      location: location,
      radius: radius,
      query: search
    }, callback);
  }

  useEffect(()=>{
    if(search !== ""){
      setLoading(true)
      handleSearch()
    }
  }, [center])

  return (
    <div className="App" style={{ height: '100vh', width: '100%' }}>
      <h1>Sensible Weather Nearby Search</h1>
      <div style={{ height: '50%', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyDIb6tuC5IBX5yf8pYBMs_hLkZicqDHZ9k", libraries:['places'] }}
          defaultZoom={11}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={ async ({ map, maps }) => {
            mapRef.current = map
            mapsRef.current = maps
          }}
          center={center}
        >
        {placesArr}
        </GoogleMapReact>
      </div>

      <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center"}}>
        <div onChange={(event)=>{handleRadioClick(event.target.value)}}>
          {
            PLACES.map((place, index) => {
              return (
                <div key={index} style={{display: "flex", justifyContent: "flex-start", margin: "10px"}}>
                  <input onChange={()=>setActive(index)} checked={active === index} type="radio" value={place.id} name={place.id}/>
                  <label>{place.id}</label>
                </div>
              )
            })
          }
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
          <h4>Search</h4>
          <input ref={searchRef} value={search} onChange={(e)=>{setSearch(e.target.value)}}/>
          <label>Radius (meters):</label>
          <input ref={radiusRef} value={radius} onChange={(e)=>{setRadius(e.target.value)}}/>
          
          <button onClick={handleSearch} style={{marginTop: "20px"}}>Search</button>
        </div>
      </div>

      { 
        search === ""
        ? <h4>What would you like to find?</h4>
        : loading 
          ? <h4>Loading Results ...</h4>
          : resultsArr.length > 0 
            ? resultsArr.map(item=>{
                return (
                  <div key={item.reference} 
                    style={{
                      border: "1px solid black",
                      margin: "10px auto",
                      width: "50%",
                    }}>
                    <div style={{display: "flex", justifyContent: "space-evenly"}}>
                      <h4>{item.name}</h4>
                      <h5>Rating - {item.rating}</h5>
                    </div>
                    <div>
                      <h5>Address: {item.formatted_address}</h5>
                    </div>
                  </div>
                )
              })
            : <h4>No Results Found</h4>
      }

    </div>
  );
}

export default App;


