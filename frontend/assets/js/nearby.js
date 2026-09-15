AOS.init({duration: 800, once: true});

    let map;
    let userMarker;
    let markers = [];
    
    // Custom Icons
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const hospitalIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const pharmacyIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const mockLocationsData = [
        { name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', type: 'hospital', typeName: 'হাসপাতাল', latOffset: 0.005, lngOffset: 0.002, rating: 4.8 },
        { name: 'ল্যাবএইড স্পেশালাইজড হাসপাতাল', type: 'hospital', typeName: 'হাসপাতাল', latOffset: -0.008, lngOffset: 0.004, rating: 4.5 },
        { name: 'হোপ ফার্মেসি', type: 'pharmacy', typeName: 'ফার্মেসি', latOffset: 0.002, lngOffset: -0.003, rating: 4.2 },
        { name: 'আল মদিনা মেডিসিন কর্নার', type: 'pharmacy', typeName: 'ফার্মেসি', latOffset: -0.004, lngOffset: -0.005, rating: 4.0 },
        { name: 'রেড ক্রিসেন্ট ব্লাড ব্যাংক', type: 'bloodbank', typeName: 'ব্লাড ব্যাংক', latOffset: 0.012, lngOffset: -0.008, rating: 4.9 },
        { name: 'স্কয়ার হাসপাতাল', type: 'hospital', typeName: 'হাসপাতাল', latOffset: 0.015, lngOffset: 0.010, rating: 4.7 }
    ];

    let currentLocations = [];

    // Initialize map function
    function initMap(lat, lng) {
        const overlay = document.getElementById('mapOverlay');
        if (overlay) overlay.style.display = 'none';
        
        if (map) {
            map.setView([lat, lng], 14);
            if (userMarker) userMarker.setLatLng([lat, lng]);
        } else {
            map = L.map('map').setView([lat, lng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
            userMarker = L.marker([lat, lng], {icon: userIcon}).addTo(map)
                .bindPopup('<b>আপনার বর্তমান অবস্থান</b>').openPopup();
        }
        generateMockPlaces(lat, lng);
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1); 
    }

    function generateMockPlaces(userLat, userLng) {
        currentLocations = mockLocationsData.map((loc, index) => {
            const locLat = userLat + loc.latOffset;
            const locLng = userLng + loc.lngOffset;
            const distance = getDistance(userLat, userLng, locLat, locLng);
            return { ...loc, lat: locLat, lng: locLng, distance: parseFloat(distance), id: index };
        });
        currentLocations.sort((a, b) => a.distance - b.distance);
        renderListAndMarkers(document.getElementById('filterType').value || 'all');
    }

    function getIconForType(type) {
        if (type === 'hospital') return hospitalIcon;
        if (type === 'pharmacy') return pharmacyIcon;
        // reuse red icon for blood bank since we don't have a distinct one imported, or use a custom one
        if (type === 'bloodbank') return hospitalIcon;
        return userIcon;
    }

    function getIconHTMLForType(type) {
        if (type === 'hospital') return '<i class="fa-solid fa-hospital text-danger"></i>';
        if (type === 'pharmacy') return '<i class="fa-solid fa-pills text-success"></i>';
        if (type === 'bloodbank') return '<i class="fa-solid fa-droplet text-danger"></i>';
        return '<i class="fa-solid fa-map-marker"></i>';
    }

    function renderListAndMarkers(filter) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        const listContainer = document.getElementById('nearbyList');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        const filtered = currentLocations.filter(loc => filter === 'all' || loc.type === filter);

        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="text-muted text-center mt-4">কোনো তথ্য পাওয়া যায়নি।</p>';
            return;
        }

        filtered.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lng], {icon: getIconForType(loc.type)}).addTo(map);
            marker.bindPopup(`<b>${loc.name}</b><br>${loc.typeName} - ${loc.distance} কি.মি.`);
            markers.push(marker);

            const div = document.createElement('div');
            div.className = 'location-card d-flex align-items-center justify-content-between';
            div.onclick = () => {
                document.querySelectorAll('.location-card').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                map.flyTo([loc.lat, loc.lng], 16);
                marker.openPopup();
            };

            div.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.04); display:flex; align-items:center; justify-content:center; font-size: 1.2rem;">
                        ${getIconHTMLForType(loc.type)}
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">${loc.name}</h6>
                        <div class="text-muted small">
                            <span class="me-2">${loc.typeName}</span>
                            <span class="text-warning"><i class="fa-solid fa-star"></i> ${loc.rating}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="distance-badge">${loc.distance} KM</span>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }

    const filterEl = document.getElementById('filterType');
    if (filterEl) {
        filterEl.addEventListener('change', (e) => {
            renderListAndMarkers(e.target.value);
        });
    }

    // Immediately load default location so it never shows empty/loading forever
    initMap(23.8103, 90.4125);

    // Then try to get real location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                initMap(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.log("Using default location due to GPS block.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
