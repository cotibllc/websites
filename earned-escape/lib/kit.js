/**
 * Kit.io API Integration
 * Handles contact creation, tagging, and automation triggering
 */

const KIT_API_BASE = 'https://api.kit.com/v4';

class KitClient {
  constructor(accountId, apiKey) {
    if (!accountId || !apiKey) {
      throw new Error('Kit accountId and apiKey are required');
    }
    this.accountId = accountId;
    this.apiKey = apiKey;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${KIT_API_BASE}/${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
        console.error(`Kit API error [${response.status}]:`, error);
        throw new Error(`Kit API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Kit API request failed:', err.message);
      throw err;
    }
  }

  /**
   * Create or update a subscriber with metadata
   * @param {Object} subscriber - { email, firstName, lastName, customFields, tags }
   */
  async createOrUpdateSubscriber(subscriber) {
    const payload = {
      email_address: subscriber.email,
      first_name: subscriber.firstName || '',
      last_name: subscriber.lastName || '',
      custom_fields: subscriber.customFields || {},
      tags: subscriber.tags || [],
      state: 'active',
    };

    return this.request('subscribers', 'POST', payload);
  }

  /**
   * Add tags to an existing subscriber
   * @param {string} email - Subscriber email
   * @param {string[]} tags - Array of tag names to add
   */
  async addTagsToSubscriber(email, tags) {
    if (!tags || tags.length === 0) return;

    // Kit API uses a bulk tagging endpoint
    const payload = {
      subscribers: [{ email_address: email, tags }],
    };

    return this.request('subscribers/bulk', 'POST', payload);
  }

  /**
   * Trigger an automation for a subscriber
   * @param {number} automationId - ID of the automation to trigger
   * @param {string} email - Subscriber email
   * @param {Object} data - Optional data to pass to automation
   */
  async triggerAutomation(automationId, email, data = {}) {
    const payload = {
      subscriber: { email_address: email },
      data,
    };

    return this.request(`automations/${automationId}/trigger`, 'POST', payload);
  }

  /**
   * Get all available automations (for reference/debugging)
   */
  async getAutomations() {
    return this.request('automations');
  }
}

/**
 * Factory function to create Kit client with env vars
 */
function createKitClient() {
  const accountId = process.env.KIT_ACCOUNT_ID;
  const apiKey = process.env.KIT_API_KEY;

  if (!accountId || !apiKey) {
    console.warn('Kit credentials not configured (KIT_ACCOUNT_ID or KIT_API_KEY missing)');
    return null;
  }

  return new KitClient(accountId, apiKey);
}

module.exports = {
  KitClient,
  createKitClient,
};
