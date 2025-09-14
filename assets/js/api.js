/**
 * API Management and Data Processing
 * Handles all API calls and data processing for the frontend
 */

class PropertyAPI {
    constructor() {
        this.baseURL = 'https://valeti-444t.vercel.app/api';
        // this.baseURL = 'http://localhost:5000/api';
        this.endpoints = {
            properties: '/properties',
            propertyDetails: '/properties',
            search: '/properties/search',
            featured: '/properties/featured'
        };
    }

    /**
     * Generic API call method
     * @param {string} endpoint - API endpoint
     * @param {object} params - Query parameters
     * @returns {Promise} - API response
     */
    async makeAPICall(endpoint, params = {}) {
        try {
            const url = new URL(`${this.baseURL}${endpoint}`);
            
            // Add query parameters
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    /**
     * Get all properties with optional filters
     * @param {object} filters - Filter parameters
     * @returns {Promise} - Properties data
     */
    async getAllProperties(filters = {}) {
        try {
            const params = {
                limit: filters.limit || 100,
                page: filters.page || 1,
                ...filters
            };

            const response = await this.makeAPICall(this.endpoints.properties, params);
            return this.processPropertiesData(response);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    /**
     * Get featured properties
     * @param {number} limit - Number of featured properties to fetch
     * @returns {Promise} - Featured properties data
     */
    async getFeaturedProperties(limit = 6) {
        try {
            const params = {
                limit: limit,
                featured: true
            };

            const response = await this.makeAPICall(this.endpoints.properties, params);
            return this.processPropertiesData(response);
        } catch (error) {
            console.error('Failed to fetch featured properties:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    /**
     * Search properties based on form criteria
     * @param {object} searchCriteria - Search form data
     * @returns {Promise} - Search results
     */
    async searchProperties(searchCriteria) {
        try {
            const params = this.buildSearchParams(searchCriteria);
            const response = await this.makeAPICall(this.endpoints.properties, params);
            return this.processPropertiesData(response);
        } catch (error) {
            console.error('Failed to search properties:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    /**
     * Get property details by ID
     * @param {string} propertyId - Property ID
     * @returns {Promise} - Property details
     */
    async getPropertyDetails(propertyId) {
        try {
            const response = await this.makeAPICall(`${this.endpoints.propertyDetails}/${propertyId}`);
            return this.processPropertyDetailData(response);
        } catch (error) {
            console.error('Failed to fetch property details:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    /**
     * Process properties data from API response
     * @param {object} response - API response
     * @returns {object} - Processed data
     */
    processPropertiesData(response) {
        if (!response.success || !response.data.properties) {
            return { success: false, data: [], error: 'Invalid API response' };
        }

        const processedProperties = response.data.properties.map(property => ({
            id: property._id,
            title: property.title,
            description: property.description,
            type: property.type,
            category: property.category,
            propertyFor: property.propertyFor,
            currency: property.currency,
            location: property.location,
            features: {
                bedrooms: property.features.bedrooms,
                bathrooms: property.features.bathrooms,
                area: property.features.area,
                areaUnit: property.features.areaUnit,
                floors: property.features.floors,
                garages: property.features.garages,
                theater: property.features.theater || 0,
                furnished: property.features.furnished
            },
            amenities: property.amenities,
            images: property.images,
            primaryImage: property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || '',
            status: property.status,
            agent: property.agent,
            owner: property.owner,
            tags: property.tags,
            views: property.views,
            isFeatured: property.isFeatured,
            isActive: property.isActive,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt
        }));

        return {
            success: true,
            data: processedProperties,
            pagination: response.data.pagination || null
        };
    }

    /**
     * Process single property detail data
     * @param {object} response - API response
     * @returns {object} - Processed property detail
     */
    processPropertyDetailData(response) {
        if (!response.success || !response.data) {
            return { success: false, data: null, error: 'Invalid API response' };
        }

        const property = response.data;
        return {
            success: true,
            data: {
                id: property._id,
                title: property.title,
                description: property.description,
                type: property.type,
                category: property.category,
                propertyFor: property.propertyFor,
                currency: property.currency,
                location: property.location,
                features: property.features,
                amenities: property.amenities,
                images: property.images,
                status: property.status,
                agent: property.agent,
                owner: property.owner,
                tags: property.tags,
                views: property.views,
                isFeatured: property.isFeatured,
                isActive: property.isActive,
                documents: property.documents,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt
            }
        };
    }

    /**
     * Build search parameters from form data
     * @param {object} searchCriteria - Form search criteria
     * @returns {object} - API search parameters
     */
    buildSearchParams(searchCriteria) {
        const params = {
            limit: 50,
            page: 1
        };

        // Property Type filter
        if (searchCriteria.property_type) {
            params.category = searchCriteria.property_type;
        }

        // Bedrooms filter
        if (searchCriteria.bedrooms) {
            params.bedrooms = searchCriteria.bedrooms;
        }

        // Bathrooms filter
        if (searchCriteria.bathrooms) {
            params.bathrooms = searchCriteria.bathrooms;
        }

        // Area filter
        if (searchCriteria.area) {
            params.area = searchCriteria.area;
        }

        // Lot Size filter
        if (searchCriteria.lot_size) {
            params.propertyFor = `${searchCriteria.lot_size} meter`;
        }

        // Garage filter
        if (searchCriteria.garage) {
            params.garages = searchCriteria.garage;
        }

        // Floor Level filter
        if (searchCriteria.floor_level) {
            params.floors = searchCriteria.floor_level === 'single' ? 1 : 2;
        }

        // Location filter
        if (searchCriteria.location) {
            params.location = searchCriteria.location;
        }

        return params;
    }

    /**
     * Filter properties by category
     * @param {array} properties - Properties array
     * @param {string} category - Category to filter by
     * @returns {array} - Filtered properties
     */
    filterByCategory(properties, category) {
        if (!category) return properties;
        return properties.filter(property => 
            property.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Filter properties by lot size range
     * @param {array} properties - Properties array
     * @param {number} minSize - Minimum lot size
     * @param {number} maxSize - Maximum lot size
     * @returns {array} - Filtered properties
     */
    filterByLotSize(properties, minSize, maxSize) {
        return properties.filter(property => {
            const lotSize = parseInt(property.propertyFor);
            return lotSize >= minSize && lotSize <= maxSize;
        });
    }

    /**
     * Sort properties by various criteria
     * @param {array} properties - Properties array
     * @param {string} sortBy - Sort criteria
     * @param {string} order - Sort order (asc/desc)
     * @returns {array} - Sorted properties
     */
    sortProperties(properties, sortBy = 'createdAt', order = 'desc') {
        return properties.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'features') {
                aValue = a.features.bedrooms;
                bValue = b.features.bedrooms;
            }

            if (order === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
    }

    /**
     * Get unique property categories
     * @param {array} properties - Properties array
     * @returns {array} - Unique categories
     */
    getUniqueCategories(properties) {
        const categories = properties.map(property => property.category);
        return [...new Set(categories)];
    }

    /**
     * Get property statistics
     * @param {array} properties - Properties array
     * @returns {object} - Statistics object
     */
    getPropertyStats(properties) {
        const stats = {
            total: properties.length,
            categories: {},
            avgBedrooms: 0,
            avgBathrooms: 0,
            avgArea: 0,
            featured: properties.filter(p => p.isFeatured).length
        };

        // Calculate category distribution
        properties.forEach(property => {
            const category = property.category;
            stats.categories[category] = (stats.categories[category] || 0) + 1;
        });

        // Calculate averages
        if (properties.length > 0) {
            stats.avgBedrooms = properties.reduce((sum, p) => sum + p.features.bedrooms, 0) / properties.length;
            stats.avgBathrooms = properties.reduce((sum, p) => sum + p.features.bathrooms, 0) / properties.length;
            stats.avgArea = properties.reduce((sum, p) => sum + p.features.area, 0) / properties.length;
        }

        return stats;
    }
}

// Initialize API instance
const propertyAPI = new PropertyAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PropertyAPI, propertyAPI };
}

// Make available globally
window.PropertyAPI = PropertyAPI;
window.propertyAPI = propertyAPI;
