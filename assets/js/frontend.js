/**
 * Frontend Data Display and UI Management
 * Handles property display, search functionality, and UI interactions
 */

class PropertyDisplay {
    constructor() {
        this.api = window.propertyAPI;
        this.currentProperties = [];
        this.currentFilters = {};
        this.isLoading = false;
    }

    /**
     * Initialize the frontend
     */
    async init() {
        try {
            await this.loadInitialProperties();
            await this.loadFeaturedProperties();
            this.setupEventListeners();
            this.setupSearchForm();
        } catch (error) {
            console.error('Failed to initialize frontend:', error);
            this.showError('Failed to load properties. Please try again later.');
        }
    }

    /**
     * Load initial properties for homepage
     */
    async loadInitialProperties() {
        this.showLoading();
        
        try {
            // Fetch more properties to have a good pool for randomization
            const response = await this.api.getAllProperties({ limit: 50 });
            
            if (response.success) {
                // Get 8 random properties from the response
                this.currentProperties = this.getRandomProperties(response.data, 8);
                this.displayProperties(this.currentProperties);
                this.updatePropertyStats();
            } else {
                throw new Error(response.error || 'Failed to load properties');
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            this.showError('Failed to load properties. Please refresh the page.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Load featured properties for the featured section
     */
    async loadFeaturedProperties() {
        this.showFeaturedLoading();
        
        try {
            // Fetch all properties to filter featured ones
            const response = await this.api.getAllProperties({ limit: 100 });
            
            if (response.success) {
                // Filter featured properties
                const featuredProperties = response.data.filter(property => property.isFeatured === true);
                
                // Get 4 random featured properties
                const randomFeatured = this.getRandomProperties(featuredProperties, 4);
                
                // Display in the featured section
                this.displayFeaturedProperties(randomFeatured);
            } else {
                console.warn('Failed to load featured properties:', response.error);
                this.showNoFeaturedProperties();
            }
        } catch (error) {
            console.error('Error loading featured properties:', error);
            this.showNoFeaturedProperties();
        } finally {
            this.hideFeaturedLoading();
        }
    }

    /**
     * Get random properties from an array
     * @param {array} properties - Array of all properties
     * @param {number} count - Number of random properties to return
     * @returns {array} - Array of random properties
     */
    getRandomProperties(properties, count) {
        if (!properties || properties.length === 0) {
            return [];
        }
        
        // If we have fewer properties than requested, return all
        if (properties.length <= count) {
            return [...properties];
        }
        
        // Create a copy of the array to avoid modifying the original
        const shuffled = [...properties];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Return the first 'count' elements
        return shuffled.slice(0, count);
    }

    /**
     * Display properties in the UI
     * @param {array} properties - Properties to display
     */
    displayProperties(properties) {
        const container = document.getElementById('properties-container');
        if (!container) {
            console.warn('Properties container not found');
            return;
        }

        if (properties.length === 0) {
            container.innerHTML = this.getNoPropertiesHTML();
            return;
        }

        const propertiesHTML = properties.map(property => this.createPropertyCard(property)).join('');
        container.innerHTML = propertiesHTML;

        // Add click event listeners to property cards
        this.addPropertyCardListeners();
    }

    /**
     * Create HTML for a single property card
     * @param {object} property - Property data
     * @returns {string} - HTML string
     */
    createPropertyCard(property) {
        const imageUrl = property.primaryImage || 'assets/img/popular/popular-1-1.jpg';
        const price = property.features.area ? `$${property.features.area.toLocaleString()}` : 'Contact for Price';
        const categoryClass = this.getCategoryClass(property.category);
        
        return `
            <div class="col-xxl-3 col-xl-4 col-lg-6 col-md-6 filter-item ${categoryClass}" data-property-id="${property.id}">
                <div class="popular-list-1">
                    <div class="thumb-wrapper">
                        <div class="th-slider" data-slider-options='{"loop":false, "autoplay": false,"autoHeight": true, "effect":"fade"}'>
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <a class="popular-popup-image" href="${imageUrl}">
                                        <img src="${imageUrl}" alt="${property.title}" onerror="this.src='assets/img/popular/popular-1-1.jpg'">
                                    </a>
                                </div>
                                ${property.images && property.images.length > 1 ? property.images.slice(1, 4).map(img => `
                                    <div class="swiper-slide">
                                        <a class="popular-popup-image" href="${img.url}">
                                            <img src="${img.url}" alt="${property.title}" onerror="this.src='assets/img/popular/popular-1-1.jpg'">
                                        </a>
                                    </div>
                                `).join('') : ''}
                            </div>
                            <div class="icon-wrap">
                                <button class="slider-arrow slider-prev"><i class="far fa-arrow-left"></i></button>
                                <button class="slider-arrow slider-next"><i class="far fa-arrow-right"></i></button>
                            </div>
                        </div>
                        <div class="actions">
                            <a href="wishlist.html" class="icon-btn" data-property-id="${property.id}">
                                <i class="fas fa-heart"></i>
                            </a>
                        </div>
                        <div class="actions-style-2-wrapper">
                            <div class="actions style-2">
                                <a href="#" class="icon-btn" data-property-id="${property.id}">
                                    <span class="action-text">Add To Favorite</span>
                                    <i class="fa-solid fa-bookmark"></i>
                                </a>
                                <a href="${imageUrl}" class="icon-btn popular-popup-image">
                                    <span class="action-text">View all img</span>
                                    <i class="fa-solid fa-camera"></i>
                                </a>
                            </div>
                        </div>
                        <div class="popular-badge">
                            <img src="assets/img/icon/sell_rent_icon.svg" alt="icon">
                            <p>${property.category || 'Available'}</p>
                        </div>
                    </div>
                    <div class="property-content">
                        <div class="media-body">
                            <h3 class="box-title">
                                <a href="property-details.html?id=${property.id}">${property.title}</a>
                            </h3>
                           
                        </div>

                        <ul class="property-featured">
                            <li>
                                <div class="icon"><img src="assets/img/icon/bed.svg" alt="icon"></div>
                                Bed ${property.features.bedrooms || 0}
                            </li>
                            <li>
                                <div class="icon"><img src="assets/img/icon/bath.svg" alt="icon"></div>
                                Bath ${property.features.bathrooms || 0}
                            </li>
                            <li>
                                <div class="icon"><img src="assets/img/icon/sqft.svg" alt="icon"></div>
                                ${property.features.area || 0} ${property.features.areaUnit || 'sqft'}
                            </li>
                        </ul>
                        <div class="property-bottom">
                            <a class="th-btn sm style3 pill" href="property-details.html?id=${property.id}">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get category class for filtering
     * @param {string} category - Property category
     * @returns {string} - CSS class for filtering
     */
    getCategoryClass(category) {
        if (!category) return 'house';
        
        // Map API categories to filter classes
        const categoryMap = {
            'single story': 'single-story',
            'single-story': 'single-story',
            'double story': 'double-story',
            'double-story': 'double-story',
            'small lot design': 'small-lot-design',
            'small-lot-design': 'small-lot-design',
            'farm house': 'farm-house',
            'farm-house': 'farm-house',
            'house': 'house',
            'apartment': 'apartment',
            'villa': 'villa',
            'condo': 'condo'
        };
        
        const normalizedCategory = category.toLowerCase().trim();
        return categoryMap[normalizedCategory] || 'house';
    }

    /**
     * Display featured properties in the featured section
     * @param {array} properties - Featured properties to display
     */
    displayFeaturedProperties(properties) {
        const container = document.getElementById('featured-properties-container');
        if (!container) {
            console.warn('Featured properties container not found');
            return;
        }

        if (properties.length === 0) {
            container.innerHTML = this.getNoFeaturedPropertiesHTML();
            return;
        }

        const propertiesHTML = properties.map(property => this.createFeaturedPropertyCard(property)).join('');
        container.innerHTML = propertiesHTML;

        // Add click event listeners to featured property cards
        this.addPropertyCardListeners();
    }

    /**
     * Create HTML for a featured property card
     * @param {object} property - Property data
     * @returns {string} - HTML string
     */
    createFeaturedPropertyCard(property) {
        const imageUrl = property.primaryImage || 'assets/img/popular/popular-1-1.jpg';
        const categoryClass = this.getCategoryClass(property.category);
        
        return `
            <div class="col-xxl-3 col-xl-4 col-lg-6 col-md-6 filter-item ${categoryClass}" data-property-id="${property.id}">
                <div class="popular-list-1">
                    <div class="thumb-wrapper">
                        <div class="th-slider" data-slider-options='{"loop":false, "autoplay": false,"autoHeight": true, "effect":"fade"}'>
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <a class="popular-popup-image" href="${imageUrl}">
                                        <img src="${imageUrl}" alt="${property.title}" onerror="this.src='assets/img/popular/popular-1-1.jpg'">
                                    </a>
                                </div>
                                ${property.images && property.images.length > 1 ? property.images.slice(1, 4).map(img => `
                                    <div class="swiper-slide">
                                        <a class="popular-popup-image" href="${img.url}">
                                            <img src="${img.url}" alt="${property.title}" onerror="this.src='assets/img/popular/popular-1-1.jpg'">
                                        </a>
                                    </div>
                                `).join('') : ''}
                            </div>
                            <div class="icon-wrap">
                                <button class="slider-arrow slider-prev"><i class="far fa-arrow-left"></i></button>
                                <button class="slider-arrow slider-next"><i class="far fa-arrow-right"></i></button>
                            </div>
                        </div>
                        <div class="actions">
                            <a href="wishlist.html" class="icon-btn" data-property-id="${property.id}">
                                <i class="fas fa-heart"></i>
                            </a>
                        </div>
                        <div class="actions-style-2-wrapper">
                            <div class="actions style-2">
                                <a href="#" class="icon-btn" data-property-id="${property.id}">
                                    <span class="action-text">Add To Favorite</span>
                                    <i class="fa-solid fa-bookmark"></i>
                                </a>
                                <a href="${imageUrl}" class="icon-btn popular-popup-image">
                                    <span class="action-text">View all img</span>
                                    <i class="fa-solid fa-camera"></i>
                                </a>
                            </div>
                        </div>
                        <div class="popular-badge">
                            <img src="assets/img/icon/sell_rent_icon.svg" alt="icon">
                            <p>${property.category || 'Featured'}</p>
                        </div>
                    </div>
                    <div class="property-content">
                        <div class="media-body">
                            <h3 class="box-title">
                                <a href="property-details.html?id=${property.id}">${property.title}</a>
                            </h3>
                        </div>

                        <ul class="property-featured">
                            <li>
                                <div class="icon"><img src="assets/img/icon/bed.svg" alt="icon"></div>
                                Bed ${property.features.bedrooms || 0}
                            </li>
                            <li>
                                <div class="icon"><img src="assets/img/icon/bath.svg" alt="icon"></div>
                                Bath ${property.features.bathrooms || 0}
                            </li>
                            <li>
                                <div class="icon"><img src="assets/img/icon/sqft.svg" alt="icon"></div>
                                ${property.features.area || 0} ${property.features.areaUnit || 'sqft'}
                            </li>
                        </ul>
                        <div class="property-bottom">
                            <a class="th-btn sm style3 pill" href="property-details.html?id=${property.id}">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for no properties found
     * @returns {string} - HTML string
     */
    getNoPropertiesHTML() {
        return `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="th-empty-state">
                        <i class="fa-light fa-home fa-3x mb-3 text-muted"></i>
                        <h4 class="mb-3">No Properties Found</h4>
                        <p class="text-muted mb-4">We couldn't find any properties matching your criteria.</p>
                        <button type="button" class="th-btn" onclick="propertyDisplay.clearFilters()">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for no featured properties found
     * @returns {string} - HTML string
     */
    getNoFeaturedPropertiesHTML() {
        return `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="th-empty-state">
                        <i class="fa-light fa-star fa-3x mb-3 text-muted"></i>
                        <h4 class="mb-3">No Featured Properties</h4>
                        <p class="text-muted mb-4">We don't have any featured properties at the moment.</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Add event listeners to property cards
     */
    addPropertyCardListeners() {
        const propertyCards = document.querySelectorAll('[data-property-id]');
        propertyCards.forEach(card => {
            const wishlistBtn = card.querySelector('.actions .icon-btn[data-property-id]');
            const favoriteBtn = card.querySelector('.actions.style-2 .icon-btn[data-property-id]');
            
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const propertyId = card.getAttribute('data-property-id');
                    this.toggleWishlist(propertyId);
                });
            }

            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const propertyId = card.getAttribute('data-property-id');
                    this.toggleWishlist(propertyId);
                });
            }
        });
    }

    /**
     * Setup search form event listeners
     */
    setupSearchForm() {
        const searchForms = document.querySelectorAll('form[data-search-form]');
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(form);
            });
        });
    }

    /**
     * Handle search form submission
     * @param {HTMLFormElement} form - Search form element
     */
    async handleSearch(form) {
        const formData = new FormData(form);
        const searchCriteria = {};
        
        // Extract form data
        for (let [key, value] of formData.entries()) {
            if (value && value !== '') {
                searchCriteria[key] = value;
            }
        }

        // Get additional form inputs that might not be in FormData
        const additionalInputs = form.querySelectorAll('select, input[type="text"], input[type="number"]');
        additionalInputs.forEach(input => {
            if (input.value && input.value !== '' && !searchCriteria[input.name]) {
                searchCriteria[input.name] = input.value;
            }
        });

        this.currentFilters = searchCriteria;
        await this.performSearch(searchCriteria);
    }

    /**
     * Perform property search
     * @param {object} searchCriteria - Search criteria
     */
    async performSearch(searchCriteria) {
        this.showLoading();
        
        try {
            const response = await this.api.searchProperties(searchCriteria);
            
            if (response.success) {
                this.currentProperties = response.data;
                this.displayProperties(this.currentProperties);
                this.updateSearchResultsCount(this.currentProperties.length);
            } else {
                throw new Error(response.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Clear all filters and reload properties
     */
    async clearFilters() {
        this.currentFilters = {};
        
        // Reset form inputs
        const forms = document.querySelectorAll('form[data-search-form]');
        forms.forEach(form => {
            form.reset();
        });

        // Reset filter buttons to "View All"
        const filterButtons = document.querySelectorAll('.filter-menu [data-filter]');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const viewAllButton = document.querySelector('.filter-menu [data-filter="*"]');
        if (viewAllButton) {
            viewAllButton.classList.add('active');
        }

        await this.loadInitialProperties();
    }

    /**
     * Show quick view modal for property
     * @param {string} propertyId - Property ID
     */
    async showQuickView(propertyId) {
        try {
            const response = await this.api.getPropertyDetails(propertyId);
            
            if (response.success) {
                // Create and show quick view modal
                this.createQuickViewModal(response.data);
            } else {
                throw new Error(response.error || 'Failed to load property details');
            }
        } catch (error) {
            console.error('Quick view error:', error);
            this.showError('Failed to load property details.');
        }
    }

    /**
     * Toggle wishlist for property
     * @param {string} propertyId - Property ID
     */
    toggleWishlist(propertyId) {
        // Implement wishlist functionality
        console.log('Toggle wishlist for property:', propertyId);
        // You can implement local storage or API call for wishlist
    }

    /**
     * Update property statistics display
     */
    updatePropertyStats() {
        const stats = this.api.getPropertyStats(this.currentProperties);
        
        // Update stats elements if they exist
        const totalElement = document.getElementById('total-properties');
        if (totalElement) {
            totalElement.textContent = stats.total;
        }

        const featuredElement = document.getElementById('featured-properties');
        if (featuredElement) {
            featuredElement.textContent = stats.featured;
        }
    }

    /**
     * Update search results count
     * @param {number} count - Number of results
     */
    updateSearchResultsCount(count) {
        const resultsElement = document.getElementById('search-results-count');
        if (resultsElement) {
            resultsElement.textContent = `${count} properties found`;
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.isLoading = true;
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // Add loading class to properties container
        const container = document.getElementById('properties-container');
        if (container) {
            container.classList.add('loading');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.isLoading = false;
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Remove loading class from properties container
        const container = document.getElementById('properties-container');
        if (container) {
            container.classList.remove('loading');
        }
    }

    /**
     * Show loading indicator for featured section
     */
    showFeaturedLoading() {
        const loadingElement = document.getElementById('featured-loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // Add loading class to featured properties container
        const container = document.getElementById('featured-properties-container');
        if (container) {
            container.classList.add('loading');
        }
    }

    /**
     * Hide loading indicator for featured section
     */
    hideFeaturedLoading() {
        const loadingElement = document.getElementById('featured-loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Remove loading class from featured properties container
        const container = document.getElementById('featured-properties-container');
        if (container) {
            container.classList.remove('loading');
        }
    }

    /**
     * Show no featured properties message
     */
    showNoFeaturedProperties() {
        const container = document.getElementById('featured-properties-container');
        if (container) {
            container.innerHTML = this.getNoFeaturedPropertiesHTML();
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorContainer = document.getElementById('error-container') || this.createErrorContainer();
        errorContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fa-light fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
        errorContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    /**
     * Create error container if it doesn't exist
     * @returns {HTMLElement} - Error container element
     */
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        container.style.display = 'none';
        container.className = 'container mt-3';
        
        const propertiesContainer = document.getElementById('properties-container');
        if (propertiesContainer && propertiesContainer.parentNode) {
            propertiesContainer.parentNode.insertBefore(container, propertiesContainer);
        }
        
        return container;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter buttons for properties section
        const filterButtons = document.querySelectorAll('.filter-menu [data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filterValue = button.getAttribute('data-filter');
                this.applyFilter(filterValue);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-properties');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProperties(e.target.value);
            });
        }
    }

    /**
     * Apply filter to properties
     * @param {string} filterValue - Filter value
     */
    applyFilter(filterValue) {
        if (filterValue === '*') {
            this.displayProperties(this.currentProperties);
        } else {
            // Remove the dot from filterValue if it exists (e.g., ".single-story" -> "single-story")
            const cleanFilterValue = filterValue.startsWith('.') ? filterValue.substring(1) : filterValue;
            
            const filteredProperties = this.currentProperties.filter(property => {
                const categoryClass = this.getCategoryClass(property.category);
                return categoryClass === cleanFilterValue;
            });
            
            // Show filtered properties or no data message
            if (filteredProperties.length === 0) {
                this.showNoDataMessage(cleanFilterValue);
            } else {
                this.displayProperties(filteredProperties);
            }
        }
    }

    /**
     * Show no data message for specific filter
     * @param {string} filterValue - Filter value that has no results
     */
    showNoDataMessage(filterValue) {
        const container = document.getElementById('properties-container');
        if (!container) return;

        const filterName = this.getFilterDisplayName(filterValue);
        
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="th-empty-state">
                        <i class="fa-light fa-home fa-3x mb-3 text-muted"></i>
                        <h4 class="mb-3">No ${filterName} Properties Found</h4>
                        <p class="text-muted mb-4">We don't have any ${filterName.toLowerCase()} properties available at the moment.</p>
                        <button type="button" class="th-btn" onclick="propertyDisplay.clearFilters()">
                            View All Properties
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get display name for filter
     * @param {string} filterValue - Filter value
     * @returns {string} - Display name
     */
    getFilterDisplayName(filterValue) {
        const filterNames = {
            'single-story': 'Single Story',
            'double-story': 'Double Story',
            'small-lot-design': 'Small Lot Design',
            'farm-house': 'Farm House',
            'house': 'House',
            'apartment': 'Apartment',
            'villa': 'Villa',
            'condo': 'Condo'
        };
        
        return filterNames[filterValue] || filterValue;
    }

    /**
     * Sort properties
     * @param {string} sortBy - Sort criteria
     */
    sortProperties(sortBy) {
        const sortedProperties = this.api.sortProperties(this.currentProperties, sortBy);
        this.displayProperties(sortedProperties);
    }
}

// Initialize frontend when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.propertyDisplay = new PropertyDisplay();
    window.propertyDisplay.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyDisplay;
}

// Make available globally
window.PropertyDisplay = PropertyDisplay;
