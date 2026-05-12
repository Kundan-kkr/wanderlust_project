
console.log(coordinates);

const map = new maplibregl.Map({
    container: "map",

    style: "https://tiles.openfreemap.org/styles/bright",

    center: coordinates,
    zoom: 11,
});

new maplibregl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
            `<h4>${listingTitle}</h4>
             <p>Exact location will be provided after booking</p>`
        )
    )
    .addTo(map);