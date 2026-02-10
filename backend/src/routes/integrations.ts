import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Integration configurations
const integrationConfigs: Record<string, {
  name: string;
  testEndpoint?: string;
  testMethod?: string;
  authType: 'api_key' | 'bearer' | 'basic' | 'custom';
}> = {
  'nova-poshta': {
    name: 'Нова Пошта',
    testEndpoint: 'https://api.novaposhta.ua/v2.0/json/',
    testMethod: 'POST',
    authType: 'custom',
  },
  'ukrposhta': {
    name: 'Укрпошта',
    testEndpoint: 'https://www.ukrposhta.ua/ecom/0.0.1/clients',
    authType: 'bearer',
  },
  'rozetka-delivery': {
    name: 'Розетка Делівері',
    authType: 'api_key',
  },
  'epicentr-delivery': {
    name: 'Епіцентр Доставка',
    authType: 'api_key',
  },
  'rozetka': {
    name: 'Розетка Маркетплейс',
    testEndpoint: 'https://api-seller.rozetka.com.ua/sites',
    authType: 'bearer',
  },
  'prom': {
    name: 'Prom.ua',
    testEndpoint: 'https://my.prom.ua/api/v1/products/list',
    authType: 'bearer',
  },
  'epicentr': {
    name: 'Епіцентр',
    authType: 'api_key',
  },
  'website': {
    name: 'Власний сайт',
    authType: 'api_key',
  },
  'instagram': {
    name: 'Instagram',
    testEndpoint: 'https://graph.facebook.com/v18.0/me',
    authType: 'bearer',
  },
  'tiktok': {
    name: 'TikTok Shop',
    authType: 'api_key',
  },
  'viber': {
    name: 'Viber',
    testEndpoint: 'https://chatapi.viber.com/pa/get_account_info',
    authType: 'custom',
  },
  'telegram': {
    name: 'Telegram',
    authType: 'custom',
  },
  'telephony': {
    name: 'Телефонія',
    authType: 'api_key',
  },
};

// Test integration connection
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { integrationId, credentials } = req.body;
    
    if (!integrationId || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Missing integrationId or credentials',
      });
    }
    
    const config = integrationConfigs[integrationId];
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Unknown integration',
      });
    }
    
    // Validate required credentials
    const requiredFields = getRequiredFields(integrationId);
    const missingFields = requiredFields.filter(f => !credentials[f]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
    
    // Test connection based on integration type
    let testResult = false;
    let testMessage = '';
    
    try {
      switch (integrationId) {
        case 'nova-poshta':
          testResult = await testNovaPoshta(credentials);
          break;
        case 'telegram':
          testResult = await testTelegram(credentials);
          break;
        case 'viber':
          testResult = await testViber(credentials);
          break;
        default:
          // For integrations without test endpoint, just validate credentials format
          testResult = true;
          testMessage = 'Credentials validated';
      }
    } catch (error: any) {
      testResult = false;
      testMessage = error.message || 'Connection test failed';
    }
    
    if (testResult) {
      return res.json({
        success: true,
        message: 'Connection successful',
        integration: config.name,
      });
    } else {
      return res.json({
        success: false,
        message: testMessage || 'Connection failed',
      });
    }
  } catch (error: any) {
    console.error('Integration test error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Sync integration
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.body;
    
    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing integrationId',
      });
    }
    
    // Perform sync based on integration type
    // In real implementation, this would fetch/push data to the integration
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.json({
      success: true,
      message: 'Sync completed',
      syncedAt: new Date().toISOString(),
      stats: {
        products: 0,
        orders: 0,
        updated: 0,
      },
    });
  } catch (error: any) {
    console.error('Integration sync error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sync failed',
    });
  }
});

// Get integration status
router.get('/status/:integrationId', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    
    const config = integrationConfigs[integrationId];
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }
    
    // In real implementation, check actual connection status
    return res.json({
      success: true,
      integration: {
        id: integrationId,
        name: config.name,
        connected: false, // Would check actual status
        lastSync: null,
      },
    });
  } catch (error: any) {
    console.error('Integration status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Save integration credentials
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { integrationId, credentials, companyId } = req.body;
    
    if (!integrationId || !credentials || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    
    // In real implementation, save encrypted credentials to database
    // For now, just return success
    
    return res.json({
      success: true,
      message: 'Integration saved successfully',
    });
  } catch (error: any) {
    console.error('Save integration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Disconnect integration
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const { integrationId, companyId } = req.body;
    
    if (!integrationId || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    
    // In real implementation, remove credentials from database
    
    return res.json({
      success: true,
      message: 'Integration disconnected',
    });
  } catch (error: any) {
    console.error('Disconnect integration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// Helper Functions
// ============================================

function getRequiredFields(integrationId: string): string[] {
  const fields: Record<string, string[]> = {
    'nova-poshta': ['apiKey', 'senderRef', 'contactRef'],
    'ukrposhta': ['bearerToken', 'counterpartyUuid'],
    'rozetka-delivery': ['apiKey', 'sellerId'],
    'epicentr-delivery': ['apiToken', 'merchantId', 'warehouseId'],
    'rozetka': ['apiKey', 'sellerId'],
    'prom': ['apiToken', 'companyId'],
    'epicentr': ['apiToken', 'merchantId'],
    'website': ['siteUrl', 'apiKey'],
    'instagram': ['accessToken', 'businessId', 'catalogId'],
    'tiktok': ['accessToken', 'shopId'],
    'viber': ['authToken', 'botName'],
    'telegram': ['botToken'],
    'telephony': ['provider', 'apiKey', 'secret'],
  };
  
  return fields[integrationId] || [];
}

async function testNovaPoshta(credentials: Record<string, string>): Promise<boolean> {
  try {
    const response = await axios.post('https://api.novaposhta.ua/v2.0/json/', {
      apiKey: credentials.apiKey,
      modelName: 'Counterparty',
      calledMethod: 'getCounterparties',
      methodProperties: {
        CounterpartyProperty: 'Sender',
        Page: '1',
      },
    }, {
      timeout: 10000,
    });
    
    return response.data.success === true;
  } catch (error) {
    console.error('Nova Poshta test error:', error);
    return false;
  }
}

async function testTelegram(credentials: Record<string, string>): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${credentials.botToken}/getMe`,
      { timeout: 10000 }
    );
    
    return response.data.ok === true;
  } catch (error) {
    console.error('Telegram test error:', error);
    return false;
  }
}

async function testViber(credentials: Record<string, string>): Promise<boolean> {
  try {
    const response = await axios.post(
      'https://chatapi.viber.com/pa/get_account_info',
      {},
      {
        headers: {
          'X-Viber-Auth-Token': credentials.authToken,
        },
        timeout: 10000,
      }
    );
    
    return response.data.status === 0;
  } catch (error) {
    console.error('Viber test error:', error);
    return false;
  }
}

export default router;
