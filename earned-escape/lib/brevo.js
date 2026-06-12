/**
 * Brevo (Sendinblue) API Integration
 * Handles contact creation, list management, and automation triggering
 * Free tier: 300 emails/day, basic automation
 */

const BREVO_API_BASE = 'https://api.brevo.com/v3';

class BrevoClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Brevo API key is required');
    }
    this.apiKey = apiKey;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${BREVO_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.text();
        console.error(`Brevo API error [${response.status}]:`, error);
        throw new Error(`Brevo API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Brevo API request failed:', err.message);
      throw err;
    }
  }

  /**
   * Create or update a contact
   * @param {Object} contact - { email, firstName, lastName, attributes, listIds }
   */
  async createOrUpdateContact(contact) {
    const payload = {
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      attributes: contact.attributes || {},
      listIds: contact.listIds || [], // Array of list IDs to add contact to
    };

    return this.request('/contacts', 'POST', payload);
  }

  /**
   * Add contact to a specific list (for segmentation)
   * @param {string} email - Contact email
   * @param {number} listId - Brevo list ID
   */
  async addContactToList(email, listId) {
    const payload = {
      emails: [email],
    };

    return this.request(`/contacts/lists/${listId}/contacts/add`, 'POST', payload);
  }

  /**
   * Update contact attributes (custom fields)
   * @param {string} email - Contact email
   * @param {Object} attributes - Key-value pairs of custom fields
   */
  async updateContactAttributes(email, attributes) {
    const payload = {
      attributes,
    };

    return this.request(`/contacts/${email}`, 'PUT', payload);
  }

  /**
   * Get contact details
   * @param {string} email - Contact email
   */
  async getContact(email) {
    return this.request(`/contacts/${email}`, 'GET');
  }
}

/**
 * Factory function to create Brevo client with env vars
 */
function createBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('Brevo API key not configured (BREVO_API_KEY missing)');
    return null;
  }

  return new BrevoClient(apiKey);
}

module.exports = {
  BrevoClient,
  createBrevoClient,
};
