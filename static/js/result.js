document.getElementById('flight-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const arrival = document.getElementById('arrival').value;
    const resultsList = document.getElementById('results-list');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous results
    resultsList.innerHTML = '';
    errorMessage.style.display = 'none';
    loadingMessage.style.display = 'block';

    // Build query string
    let query = `?departure=${encodeURIComponent(departure)}&arrival=${encodeURIComponent(arrival)}`;

    // Fetch flight data from API
    fetch(`/api/get_flights${query}`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // For debugging
            loadingMessage.style.display = 'none';

            if (data.flights && data.flights.length > 0) {
                data.flights.forEach(flight => {
                    const flightCard = document.createElement('div');
                    flightCard.classList.add('flight-card');
                    
                    // Format dates and times
                    const departureDate = new Date(flight.departure_date).toLocaleDateString('en-GB');
                    const arrivalDate = new Date(flight.arrival_date).toLocaleDateString('en-GB');
                    const departureTime = flight.departure_time ? flight.departure_time.substring(0,5) : '--:--';
                    const arrivalTime = flight.arrival_time ? flight.arrival_time.substring(0,5) : '--:--';
                    const flightPrice = flight.flight_price ? `₹${flight.flight_price.toFixed(2)}` : 'Price N/A';
                    const flightDuration = flight.flight_duration || 'Duration N/A';
                    
                    // Extract airport codes from parentheses if available
                    const departureAirport = flight.departure ? flight.departure.match(/\(([^)]+)\)/)?.[1] || flight.departure : 'N/A';
                    const arrivalAirport = flight.arrival ? flight.arrival.match(/\(([^)]+)\)/)?.[1] || flight.arrival : 'N/A';

                    flightCard.innerHTML = `
                        <div class="flight-header">
                            <div class="airline-info">
                                <div class="airline-logo">${flight.flight_agency?.charAt(0) || ''}</div>
                                <div>
                                    <div class="airline-name">${flight.flight_agency || 'Airline N/A'}</div>
                                    <div class="flight-number">${flight.flight_number || 'Flight N/A'}</div>
                                </div>
                            </div>
                            <div class="flight-type ${flight.flight_type?.toLowerCase() || ''}">
                                ${flight.flight_type || 'Class N/A'}
                            </div>
                        </div>
                        
                        <div class="flight-schedule">
                            <div class="departure">
                                <div class="time">${departureTime}</div>
                                <div class="date">${departureDate}</div>
                                <div class="airport">${departureAirport}</div>
                                <div class="city">${flight.departure_city || 'City N/A'}</div>
                            </div>
                            
                            <div class="flight-duration">
                                <div class="duration">${flightDuration}</div>
                                <div class="flight-arrow">→</div>
                            </div>
                            
                            <div class="arrival">
                                <div class="time">${arrivalTime}</div>
                                <div class="date">${arrivalDate}</div>
                                <div class="airport">${arrivalAirport}</div>
                                <div class="city">${flight.arrival_city || 'City N/A'}</div>
                            </div>
                        </div>
                        
                        <div class="flight-footer">
                            <div class="price">${flightPrice}</div>
                            <button class="book-button">Book Now</button>
                        </div>
                    `;
                    
                    resultsList.appendChild(flightCard);
                });
            } else {
                resultsList.innerHTML = '<p class="no-flights">No flights found for your selected route.</p>';
            }
        })
        .catch(error => {
            console.error("Error fetching flights:", error);
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Error: ${error.message}`;
        });
});