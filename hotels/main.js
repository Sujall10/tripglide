// Hotel Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show the corresponding page based on the tab
            const tabType = this.getAttribute('data-tab');
            
            // Hide all pages
            document.querySelectorAll('#main-page, #results-page, #hotel-page, #hotel-results-page').forEach(page => {
                page.classList.add('hidden-page');
                page.classList.remove('active-page');
            });
            
            // Show the selected page
            if (tabType === 'flights') {
                document.getElementById('main-page').classList.add('active-page');
                document.getElementById('main-page').classList.remove('hidden-page');
            } else if (tabType === 'hotels') {
                document.getElementById('hotel-page').classList.add('active-page');
                document.getElementById('hotel-page').classList.remove('hidden-page');
                initHotelPage();
            } else if (tabType === 'cars') {
                // Car hire functionality would go here
                alert('Car hire functionality coming soon!');
            }
        });
    });
    
    // Initialize hotel page components
    function initHotelPage() {
        // Populate popular destinations
        populatePopularDestinations();
        
        // Populate hotel deals
        populateHotelDeals();
        
        // Setup rooms & guests dropdown
        setupRoomsGuestsDropdown();
        
        // Setup search button
        setupHotelSearchButton();
    }
    
    // Setup rooms & guests dropdown functionality
    function setupRoomsGuestsDropdown() {
        const roomsGuestsField = document.querySelector('.rooms-guests-field');
        const roomsGuestsInput = document.getElementById('rooms-guests-input');
        const addRoomBtn = document.getElementById('add-room-btn');
        const doneBtn = document.querySelector('.rooms-guests-dropdown .done-btn');
        
        // Toggle dropdown visibility
        roomsGuestsInput.addEventListener('click', function() {
            roomsGuestsField.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!roomsGuestsField.contains(event.target)) {
                roomsGuestsField.classList.remove('active');
            }
        });
        
        // Handle done button
        doneBtn.addEventListener('click', function() {
            updateRoomsGuestsInput();
            roomsGuestsField.classList.remove('active');
        });
        
        // Room management
        let roomCount = 1;
        
        // Add room button
        addRoomBtn.addEventListener('click', function() {
            roomCount++;
            addRoom(roomCount);
            
            // Show remove buttons if more than one room
            if (roomCount > 1) {
                document.querySelectorAll('.remove-room-btn').forEach(btn => {
                    btn.style.display = 'block';
                });
            }
        });
        
        // Handle guest count buttons
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('guest-minus') || event.target.classList.contains('guest-plus')) {
                const button = event.target;
                const guestType = button.getAttribute('data-type');
                const roomNum = button.getAttribute('data-room');
                const countElement = document.getElementById(`room-${roomNum}-${guestType}-count`);
                let count = parseInt(countElement.textContent);
                
                // Increase or decrease count
                if (button.classList.contains('guest-plus')) {
                    if ((guestType === 'adult' && count < 4) || (guestType === 'child' && count < 6)) {
                        count++;
                    }
                } else if (button.classList.contains('guest-minus')) {
                    // Adults minimum is 1, children minimum is 0
                    if ((guestType === 'adult' && count > 1) || (guestType === 'child' && count > 0)) {
                        count--;
                    }
                }
                
                countElement.textContent = count;
                
                // If it's a child count change, update child age selectors
                if (guestType === 'child') {
                    updateChildAgeSelectors(roomNum, count);
                }
            }
        });
        
        // Handle remove room button
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-room-btn')) {
                const roomNum = event.target.getAttribute('data-room');
                document.getElementById(`room-${roomNum}`).remove();
                roomCount--;
                
                // Hide remove buttons if only one room left
                if (roomCount === 1) {
                    document.querySelectorAll('.remove-room-btn').forEach(btn => {
                        btn.style.display = 'none';
                    });
                }
                
                // Renumber rooms
                const roomContainers = document.querySelectorAll('.room-container');
                roomContainers.forEach((container, index) => {
                    const roomNumber = index + 1;
                    container.id = `room-${roomNumber}`;
                    container.querySelector('.room-header h4').textContent = `Room ${roomNumber}`;
                    container.querySelector('.remove-room-btn').setAttribute('data-room', roomNumber);
                    
                    // Update guest controls
                    container.querySelectorAll('.guest-controls button').forEach(btn => {
                        btn.setAttribute('data-room', roomNumber);
                    });
                    
                    // Update guest count IDs
                    container.querySelectorAll('.guest-count').forEach(count => {
                        const type = count.id.includes('adult') ? 'adult' : 'child';
                        count.id = `room-${roomNumber}-${type}-count`;
                    });
                    
                    // Update child ages container ID
                    const childAges = container.querySelector('.child-ages');
                    if (childAges) {
                        childAges.id = `room-${roomNumber}-child-ages`;
                    }
                });
            }
        });
        
        // Initial setup for child age selectors
        updateChildAgeSelectors(1, 0);
        
        // Update rooms & guests input with current selection
        function updateRoomsGuestsInput() {
            const roomContainers = document.querySelectorAll('.room-container');
            let totalAdults = 0;
            let totalChildren = 0;
            
            roomContainers.forEach(room => {
                const adultCount = parseInt(room.querySelector('[id$="-adult-count"]').textContent);
                const childCount = parseInt(room.querySelector('[id$="-child-count"]').textContent);
                
                totalAdults += adultCount;
                totalChildren += childCount;
            });
            
            const totalGuests = totalAdults + totalChildren;
            const roomText = roomContainers.length === 1 ? 'room' : 'rooms';
            const guestText = totalGuests === 1 ? 'guest' : 'guests';
            
            roomsGuestsInput.value = `${roomContainers.length} ${roomText}, ${totalGuests} ${guestText}`;
        }
        
        // Add a new room to the dropdown
        function addRoom(roomNum) {
            const roomContainer = document.createElement('div');
            roomContainer.className = 'room-container';
            roomContainer.id = `room-${roomNum}`;
            
            roomContainer.innerHTML = `
                <div class="room-header">
                    <h4>Room ${roomNum}</h4>
                    <button class="remove-room-btn" data-room="${roomNum}">Remove</button>
                </div>
                <div class="guest-type">
                    <span>Adults</span>
                    <div class="guest-controls">
                        <button class="guest-minus" data-type="adult" data-room="${roomNum}">-</button>
                        <span class="guest-count" id="room-${roomNum}-adult-count">1</span>
                        <button class="guest-plus" data-type="adult" data-room="${roomNum}">+</button>
                    </div>
                </div>
                <div class="guest-type">
                    <span>Children</span>
                    <div class="guest-controls">
                        <button class="guest-minus" data-type="child" data-room="${roomNum}">-</button>
                        <span class="guest-count" id="room-${roomNum}-child-count">0</span>
                        <button class="guest-plus" data-type="child" data-room="${roomNum}">+</button>
                    </div>
                </div>
                <div class="child-ages" id="room-${roomNum}-child-ages" style="display: none;">
                    <!-- Child age selectors will be added dynamically -->
                </div>
            `;
            
            const roomsGuestsDropdown = document.querySelector('.rooms-guests-dropdown');
            roomsGuestsDropdown.insertBefore(roomContainer, addRoomBtn.parentElement);
            
            // Hide remove button if it's the first room
            if (roomCount === 1) {
                roomContainer.querySelector('.remove-room-btn').style.display = 'none';
            }
        }
        
        // Update child age selectors based on the number of children
        function updateChildAgeSelectors(roomNum, childCount) {
            const childAgesContainer = document.getElementById(`room-${roomNum}-child-ages`);
            
            // Clear existing selectors
            childAgesContainer.innerHTML = '';
            
            // Show or hide the container based on child count
            if (childCount > 0) {
                childAgesContainer.style.display = 'block';
                childAgesContainer.innerHTML = '<p>Child ages</p>';
                
                // Add age selectors for each child
                for (let i = 0; i < childCount; i++) {
                    const ageSelector = document.createElement('div');
                    ageSelector.className = 'child-age-selector';
                    
                    const label = document.createElement('label');
                    label.textContent = `Child ${i + 1}`;
                    
                    const select = document.createElement('select');
                    select.id = `room-${roomNum}-child-${i+1}-age`;
                    
                    // Add age options (0-17)
                    for (let age = 0; age <= 17; age++) {
                        const option = document.createElement('option');
                        option.value = age;
                        option.textContent = age === 0 ? 'Under 1' : `${age} years`;
                        select.appendChild(option);
                    }
                    
                    ageSelector.appendChild(label);
                    ageSelector.appendChild(select);
                    childAgesContainer.appendChild(ageSelector);
                }
            } else {
                childAgesContainer.style.display = 'none';
            }
        }
        
        // Initialize with one room
        addRoom(1);
        updateRoomsGuestsInput();
    }
    
    // Populate popular destinations
    function populatePopularDestinations() {
        const destinations = [
            { name: 'New York', image: 'images/new-york.jpg' },
            { name: 'Paris', image: 'images/paris.jpg' },
            { name: 'London', image: 'images/london.jpg' },
            { name: 'Tokyo', image: 'images/tokyo.jpg' },
            { name: 'Rome', image: 'images/rome.jpg' },
            { name: 'Barcelona', image: 'images/barcelona.jpg' }
        ];
        
        const destinationsContainer = document.querySelector('.popular-destinations');
        if (destinationsContainer) {
            destinationsContainer.innerHTML = '';
            
            destinations.forEach(destination => {
                const destinationCard = document.createElement('div');
                destinationCard.className = 'destination-card';
                destinationCard.innerHTML = `
                    <img src="${destination.image}" alt="${destination.name}">
                    <div class="destination-name">${destination.name}</div>
                `;
                
                destinationCard.addEventListener('click', function() {
                    document.getElementById('destination-input').value = destination.name;
                });
                
                destinationsContainer.appendChild(destinationCard);
            });
        }
    }
    
    // Populate hotel deals
    function populateHotelDeals() {
        const hotelDeals = [
            { name: 'Grand Hyatt', location: 'New York', price: 199, rating: 4.5, image: 'images/hotel1.jpg' },
            { name: 'Marriott Resort', location: 'Miami', price: 159, rating: 4.2, image: 'images/hotel2.jpg' },
            { name: 'Four Seasons', location: 'Paris', price: 249, rating: 4.8, image: 'images/hotel3.jpg' },
            { name: 'Hilton Garden', location: 'London', price: 179, rating: 4.3, image: 'images/hotel4.jpg' }
        ];
        
        const dealsContainer = document.querySelector('.hotel-deals');
        if (dealsContainer) {
            dealsContainer.innerHTML = '';
            
            hotelDeals.forEach(hotel => {
                const hotelCard = document.createElement('div');
                hotelCard.className = 'hotel-card';
                hotelCard.innerHTML = `
                    <img src="${hotel.image}" alt="${hotel.name}">
                    <div class="hotel-details">
                        <h4>${hotel.name}</h4>
                        <p class="location">${hotel.location}</p>
                        <div class="rating">
                            ${getRatingStars(hotel.rating)}
                            <span>${hotel.rating}</span>
                        </div>
                        <div class="price">$${hotel.price}<span>/night</span></div>
                    </div>
                `;
                
                dealsContainer.appendChild(hotelCard);
            });
        }
        
        // Generate star rating HTML
        function getRatingStars(rating) {
            let starsHTML = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            
            for (let i = 0; i < fullStars; i++) {
                starsHTML += '<span class="star full">★</span>';
            }
            
            if (hasHalfStar) {
                starsHTML += '<span class="star half">★</span>';
            }
            
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
                starsHTML += '<span class="star empty">☆</span>';
            }
            
            return starsHTML;
        }
    }
    
    // Setup hotel search button
    function setupHotelSearchButton() {
        const searchButton = document.querySelector('#hotel-page .search-button');
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                // Get search parameters
                const destination = document.getElementById('destination-input').value;
                const checkIn = document.getElementById('check-in-input').value;
                const checkOut = document.getElementById('check-out-input').value;
                const roomsGuests = document.getElementById('rooms-guests-input').value;
                
                // Validate search inputs
                if (!destination || !checkIn || !checkOut) {
                    alert('Please fill in all search fields');
                    return;
                }
                
                // Show loading state
                searchButton.textContent = 'Searching...';
                searchButton.disabled = true;
                
                // Simulate search delay
                setTimeout(() => {
                    // Hide hotel page and show results
                    document.getElementById('hotel-page').classList.add('hidden-page');
                    document.getElementById('hotel-page').classList.remove('active-page');
                    
                    document.getElementById('hotel-results-page').classList.add('active-page');
                    document.getElementById('hotel-results-page').classList.remove('hidden-page');
                    
                    // Populate search results
                    populateHotelSearchResults(destination, checkIn, checkOut);
                    
                    // Reset button state
                    searchButton.textContent = 'Search Hotels';
                    searchButton.disabled = false;
                }, 1500);
            });
        }
    }
    
    // Populate hotel search results
    function populateHotelSearchResults(destination, checkIn, checkOut) {
        // Display search parameters
        const searchParams = document.querySelector('.search-params');
        if (searchParams) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            
            searchParams.innerHTML = `
                <h3>Hotels in ${destination}</h3>
                <p>${formatDate(checkInDate)} - ${formatDate(checkOutDate)} · ${nights} night${nights > 1 ? 's' : ''}</p>
            `;
        }
        
        // Sample hotel results - in a real app, this would come from an API
        const hotels = [
            { name: 'Grand Hyatt', location: destination, price: 199, rating: 4.5, reviews: 328, image: 'images/hotel1.jpg' },
            { name: 'Marriott Resort', location: destination, price: 159, rating: 4.2, reviews: 245, image: 'images/hotel2.jpg' },
            { name: 'Four Seasons', location: destination, price: 249, rating: 4.8, reviews: 402, image: 'images/hotel3.jpg' },
            { name: 'Hilton Garden', location: destination, price: 179, rating: 4.3, reviews: 189, image: 'images/hotel4.jpg' },
            { name: 'Holiday Inn', location: destination, price: 129, rating: 3.9, reviews: 215, image: 'images/hotel5.jpg' },
            { name: 'Sheraton', location: destination, price: 189, rating: 4.4, reviews: 276, image: 'images/hotel6.jpg' }
        ];
        
        // Populate results container
        const resultsContainer = document.querySelector('.hotel-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            
            if (hotels.length === 0) {
                resultsContainer.innerHTML = '<div class="no-results">No hotels found for your search criteria</div>';
                return;
            }
            
            hotels.forEach(hotel => {
                const hotelCard = document.createElement('div');
                hotelCard.className = 'hotel-result-card';
                hotelCard.innerHTML = `
                    <div class="hotel-image">
                        <img src="${hotel.image}" alt="${hotel.name}">
                    </div>
                    <div class="hotel-result-details">
                        <h4>${hotel.name}</h4>
                        <p class="location">${hotel.location}</p>
                        <div class="rating">
                            ${getRatingStars(hotel.rating)}
                            <span>${hotel.rating} (${hotel.reviews} reviews)</span>
                        </div>
                        <div class="amenities">
                            <span>Free WiFi</span>
                            <span>Free Parking</span>
                            <span>Breakfast Included</span>
                        </div>
                    </div>
                    <div class="hotel-result-price">
                        <div class="price">$${hotel.price}<span>/night</span></div>
                        <button class="select-button">Select</button>
                    </div>
                `;
                
                resultsContainer.appendChild(hotelCard);
            });
            
            // Add select button event listeners
            document.querySelectorAll('.select-button').forEach(button => {
                button.addEventListener('click', function() {
                    alert('Booking functionality coming soon!');
                });
            });
        }
        
        // Format date helper
        function formatDate(date) {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
        
        // Generate star rating HTML
        function getRatingStars(rating) {
            let starsHTML = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            
            for (let i = 0; i < fullStars; i++) {
                starsHTML += '<span class="star full">★</span>';
            }
            
            if (hasHalfStar) {
                starsHTML += '<span class="star half">★</span>';
            }
            
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
                starsHTML += '<span class="star empty">☆</span>';
            }
            
            return starsHTML;
        }
    }
    
    // Initialize date pickers for check-in and check-out
    function initDatePickers() {
        // For a real implementation, you would use a library like flatpickr or datepicker.js
        // This is a simplified version using the browser's date input
        const checkInInput = document.getElementById('check-in-input');
        const checkOutInput = document.getElementById('check-out-input');
        
        // Set minimum dates
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        // Format dates for input
        const formatDateForInput = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Set default and min values
        checkInInput.min = formatDateForInput(today);
        checkInInput.value = formatDateForInput(today);
        
        checkOutInput.min = formatDateForInput(tomorrow);
        checkOutInput.value = formatDateForInput(tomorrow);
        
        // Update check-out min date when check-in changes
        checkInInput.addEventListener('change', function() {
            const newCheckIn = new Date(this.value);
            const newCheckOut = new Date(newCheckIn);
            newCheckOut.setDate(newCheckIn.getDate() + 1);
            
            checkOutInput.min = formatDateForInput(newCheckOut);
            
            // If current check-out is before new min, update it
            if (new Date(checkOutInput.value) <= newCheckIn) {
                checkOutInput.value = formatDateForInput(newCheckOut);
            }
        });
    }
    
    // Initialize date pickers
    initDatePickers();
    
    // Initialize destination autocomplete
    function initDestinationAutocomplete() {
        const destinationInput = document.getElementById('destination-input');
        const autocompleteResults = document.createElement('div');
        autocompleteResults.className = 'autocomplete-results';
        autocompleteResults.style.display = 'none';
        
        destinationInput.parentNode.appendChild(autocompleteResults);
        
        // Sample destinations for autocomplete
        const destinations = [
            'New York, USA', 'Paris, France', 'London, UK', 
            'Tokyo, Japan', 'Rome, Italy', 'Barcelona, Spain',
            'Amsterdam, Netherlands', 'Berlin, Germany', 'Sydney, Australia',
            'Dubai, UAE', 'Singapore', 'Hong Kong', 'San Francisco, USA',
            'Los Angeles, USA', 'Miami, USA', 'Las Vegas, USA'
        ];
        
        // Filter destinations based on input
        destinationInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            
            if (value.length < 2) {
                autocompleteResults.style.display = 'none';
                return;
            }
            
            // Filter matching destinations
            const matches = destinations.filter(dest => 
                dest.toLowerCase().includes(value)
            );
            
            // Display results
            if (matches.length > 0) {
                autocompleteResults.innerHTML = '';
                matches.forEach(match => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = match;
                    
                    item.addEventListener('click', function() {
                        destinationInput.value = match;
                        autocompleteResults.style.display = 'none';
                    });
                    
                    autocompleteResults.appendChild(item);
                });
                autocompleteResults.style.display = 'block';
            } else {
                autocompleteResults.style.display = 'none';
            }
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!destinationInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
                autocompleteResults.style.display = 'none';
            }
        });
        
        // Show results on focus if we have a value
        destinationInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                const event = new Event('input');
                destinationInput.dispatchEvent(event);
            }
        });
    }
    
    // Initialize destination autocomplete
    initDestinationAutocomplete();
});