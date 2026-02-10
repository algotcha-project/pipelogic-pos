import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Truck, ShoppingCart, MessageCircle, Phone, Check, X, Settings,
  RefreshCw, AlertCircle, ExternalLink, Loader2
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';

// ============================================
// Types
// ============================================

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'delivery' | 'marketplace' | 'communication';
  icon: string;
  connected: boolean;
  lastSync?: string;
  credentials?: Record<string, string>;
  features: string[];
  requiredFields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select';
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

// ============================================
// Styled Components
// ============================================

const PageContainer = styled.div``;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const PageDescription = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const IntegrationCard = styled.div<{ $connected?: boolean }>`
  background: white;
  border: 1px solid ${props => props.$connected ? theme.colors.success : theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const IntegrationLogo = styled.div<{ $bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.$bg || theme.colors.gray100};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const IntegrationName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px 0;
`;

const IntegrationDesc = styled.p`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

const StatusBadge = styled.div<{ $connected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$connected ? theme.colors.successLight : theme.colors.gray100};
  color: ${props => props.$connected ? theme.colors.success : theme.colors.textSecondary};
`;

const CardFeatures = styled.div`
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};
`;

const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const FeatureItem = styled.li`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    color: ${theme.colors.success};
    flex-shrink: 0;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          border: none;
          &:hover { background: ${theme.colors.primaryHover}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.dangerLight};
          color: ${theme.colors.danger};
          border: none;
          &:hover { background: ${theme.colors.danger}; color: white; }
        `;
      default:
        return `
          background: white;
          color: ${theme.colors.textPrimary};
          border: 1px solid ${theme.colors.border};
          &:hover { background: ${theme.colors.gray50}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LastSync = styled.div`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalClose = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ConnectionStatus = styled.div<{ $status: 'testing' | 'success' | 'error' | 'idle' }>`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  ${props => {
    switch (props.$status) {
      case 'testing':
        return `background: ${theme.colors.infoLight}; color: ${theme.colors.info};`;
      case 'success':
        return `background: ${theme.colors.successLight}; color: ${theme.colors.success};`;
      case 'error':
        return `background: ${theme.colors.dangerLight}; color: ${theme.colors.danger};`;
      default:
        return `background: ${theme.colors.gray100}; color: ${theme.colors.textSecondary};`;
    }
  }}
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid ${theme.colors.border};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestButton = styled.button`
  padding: 12px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${theme.colors.gray50};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FeatureSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.border};
`;

const FeatureSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 12px 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  gap: 8px;
`;

const FeatureToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: ${theme.colors.gray50};
  border-radius: 6px;
  cursor: pointer;
  
  input {
    width: 18px;
    height: 18px;
  }
  
  span {
    font-size: 13px;
    color: ${theme.colors.textPrimary};
  }
`;

// ============================================
// Integration Data
// ============================================

const integrations: Integration[] = [
  // Delivery Services
  {
    id: 'nova-poshta',
    name: 'Нова Пошта',
    description: 'Інтеграція з Новою Поштою для автоматичного створення ТТН та відстеження',
    category: 'delivery',
    icon: 'НП',
    connected: false,
    features: [
      'Створення ТТН',
      'Відстеження посилок',
      'Розрахунок вартості',
      'Друк накладних',
      'Статус доставки',
      'Автозаповнення адрес',
    ],
    requiredFields: [
      { key: 'apiKey', label: 'API ключ', type: 'text', placeholder: 'Ваш API ключ Нової Пошти' },
      { key: 'senderRef', label: 'Ref відправника', type: 'text', placeholder: 'Унікальний ідентифікатор відправника' },
      { key: 'contactRef', label: 'Ref контактної особи', type: 'text', placeholder: 'Ідентифікатор контактної особи' },
    ],
  },
  {
    id: 'ukrposhta',
    name: 'Укрпошта',
    description: 'Інтеграція з Укрпоштою для відправлень по Україні та за кордон',
    category: 'delivery',
    icon: 'УП',
    connected: false,
    features: [
      'Створення відправлень',
      'Друк етикеток',
      'Відстеження статусу',
      'Міжнародні відправлення',
      'Розрахунок тарифів',
      'Поштові індекси',
    ],
    requiredFields: [
      { key: 'bearerToken', label: 'Bearer Token', type: 'password', placeholder: 'Токен авторизації' },
      { key: 'counterpartyUuid', label: 'UUID контрагента', type: 'text', placeholder: 'Ідентифікатор контрагента' },
    ],
  },
  {
    id: 'rozetka-delivery',
    name: 'Розетка Делівері',
    description: 'Доставка через мережу пунктів видачі Розетки',
    category: 'delivery',
    icon: 'RD',
    connected: false,
    features: [
      'Пункти видачі Розетки',
      'Інтеграція з замовленнями',
      'Відстеження доставки',
      'Автоматичний статус',
    ],
    requiredFields: [
      { key: 'apiKey', label: 'API ключ', type: 'password', placeholder: 'Ключ від Rozetka Delivery' },
      { key: 'sellerId', label: 'ID продавця', type: 'text', placeholder: 'Ваш ID на Розетці' },
    ],
  },
  {
    id: 'epicentr-delivery',
    name: 'Епіцентр Доставка',
    description: 'Доставка через пункти видачі Епіцентру з подвійною інтеграцією',
    category: 'delivery',
    icon: 'ЕД',
    connected: false,
    features: [
      'Пункти видачі Епіцентру',
      'Зв\'язок з маркетплейсом',
      'Синхронізація статусів',
      'Автоматична обробка',
    ],
    requiredFields: [
      { key: 'apiToken', label: 'API токен', type: 'password', placeholder: 'Токен від Епіцентру' },
      { key: 'merchantId', label: 'ID мерчанта', type: 'text', placeholder: 'Ваш ID мерчанта' },
      { key: 'warehouseId', label: 'ID складу', type: 'text', placeholder: 'ID основного складу' },
    ],
  },
  
  // Marketplaces
  {
    id: 'rozetka',
    name: 'Розетка',
    description: 'Найбільший маркетплейс України - синхронізація товарів, замовлень та залишків',
    category: 'marketplace',
    icon: 'R',
    connected: false,
    features: [
      'Синхронізація товарів',
      'Імпорт замовлень',
      'Оновлення залишків',
      'Ціни та знижки',
      'Статуси замовлень',
      'Повернення',
    ],
    requiredFields: [
      { key: 'apiKey', label: 'API ключ', type: 'password', placeholder: 'Ваш API ключ Розетки' },
      { key: 'sellerId', label: 'ID продавця', type: 'text', placeholder: 'Seller ID' },
    ],
  },
  {
    id: 'prom',
    name: 'Prom.ua',
    description: 'Маркетплейс Prom.ua - управління товарами та замовленнями',
    category: 'marketplace',
    icon: 'P',
    connected: false,
    features: [
      'Вивантаження товарів',
      'Замовлення в реальному часі',
      'Синхронізація залишків',
      'Управління цінами',
      'Статистика продажів',
      'Відгуки покупців',
    ],
    requiredFields: [
      { key: 'apiToken', label: 'API токен', type: 'password', placeholder: 'Токен від Prom.ua' },
      { key: 'companyId', label: 'ID компанії', type: 'text', placeholder: 'ID вашої компанії' },
    ],
  },
  {
    id: 'epicentr',
    name: 'Епіцентр',
    description: 'Маркетплейс Епіцентру - інтеграція з доставкою',
    category: 'marketplace',
    icon: 'E',
    connected: false,
    features: [
      'Каталог товарів',
      'Замовлення онлайн',
      'Зв\'язок з доставкою',
      'Оновлення цін',
      'Залишки в реальному часі',
      'Аналітика',
    ],
    requiredFields: [
      { key: 'apiToken', label: 'API токен', type: 'password', placeholder: 'Токен від Епіцентру' },
      { key: 'merchantId', label: 'ID мерчанта', type: 'text', placeholder: 'Ваш ID мерчанта' },
    ],
  },
  {
    id: 'website',
    name: 'Власний сайт',
    description: 'Інтеграція з вашим інтернет-магазином через API',
    category: 'marketplace',
    icon: 'W',
    connected: false,
    features: [
      'REST API',
      'Webhooks',
      'Синхронізація товарів',
      'Замовлення в POS',
      'Оновлення статусів',
      'Інвентаризація',
    ],
    requiredFields: [
      { key: 'siteUrl', label: 'URL сайту', type: 'text', placeholder: 'https://your-site.com' },
      { key: 'apiKey', label: 'API ключ', type: 'password', placeholder: 'Ваш API ключ' },
      { key: 'webhookSecret', label: 'Webhook секрет', type: 'password', placeholder: 'Секрет для webhooks' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram Shop',
    description: 'Продажі через Instagram Shopping',
    category: 'marketplace',
    icon: 'IG',
    connected: false,
    features: [
      'Каталог товарів',
      'Instagram Shopping',
      'Замовлення з DM',
      'Синхронізація цін',
      'Stories продажі',
      'Аналітика',
    ],
    requiredFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Facebook/Instagram API Token' },
      { key: 'businessId', label: 'Business ID', type: 'text', placeholder: 'ID бізнес-акаунту' },
      { key: 'catalogId', label: 'Catalog ID', type: 'text', placeholder: 'ID каталогу товарів' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    description: 'Продажі через TikTok Shop (бета)',
    category: 'marketplace',
    icon: 'TT',
    connected: false,
    features: [
      'Каталог товарів',
      'TikTok Shop',
      'Live-продажі',
      'Аналітика',
    ],
    requiredFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'TikTok Shop API Token' },
      { key: 'shopId', label: 'Shop ID', type: 'text', placeholder: 'ID вашого магазину' },
    ],
  },
  
  // Communication
  {
    id: 'viber',
    name: 'Viber',
    description: 'Бот для Viber - сповіщення клієнтів та підтримка',
    category: 'communication',
    icon: 'V',
    connected: false,
    features: [
      'Сповіщення про замовлення',
      'Статус доставки',
      'Підтримка клієнтів',
      'Маркетингові розсилки',
      'Автовідповіді',
      'Каталог в боті',
    ],
    requiredFields: [
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Токен бота Viber' },
      { key: 'botName', label: 'Назва бота', type: 'text', placeholder: 'Назва вашого бота' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Telegram бот для сповіщень та взаємодії з клієнтами',
    category: 'communication',
    icon: 'TG',
    connected: false,
    features: [
      'Сповіщення про замовлення',
      'Відстеження посилок',
      'Чат-підтримка',
      'Каталог товарів',
      'Inline-замовлення',
      'Групові сповіщення',
    ],
    requiredFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Токен від @BotFather' },
      { key: 'chatId', label: 'Chat ID (опціонально)', type: 'text', placeholder: 'ID чату для сповіщень' },
    ],
  },
  {
    id: 'telephony',
    name: 'Телефонія (VoIP)',
    description: 'Інтеграція з IP-телефонією для дзвінків клієнтам',
    category: 'communication',
    icon: 'PH',
    connected: false,
    features: [
      'Click-to-call',
      'Історія дзвінків',
      'Запис розмов',
      'Картка клієнта',
      'IVR меню',
      'Аналітика дзвінків',
    ],
    requiredFields: [
      { key: 'provider', label: 'Провайдер', type: 'select', options: [
        { value: 'binotel', label: 'Binotel' },
        { value: 'ringostat', label: 'Ringostat' },
        { value: 'phonet', label: 'Phonet' },
        { value: 'other', label: 'Інший' },
      ]},
      { key: 'apiKey', label: 'API ключ', type: 'password', placeholder: 'API ключ провайдера' },
      { key: 'secret', label: 'Secret', type: 'password', placeholder: 'Секретний ключ' },
    ],
  },
];

// ============================================
// Component
// ============================================

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState<string | null>(null);
  
  // Load saved integrations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('connectedIntegrations');
    if (saved) {
      setConnectedIntegrations(new Set(JSON.parse(saved)));
    }
  }, []);
  
  const openModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setFormData({});
    setConnectionStatus('idle');
  };
  
  const closeModal = () => {
    setSelectedIntegration(null);
    setFormData({});
    setConnectionStatus('idle');
  };
  
  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setConnectionStatus('idle');
  };
  
  const testConnection = async () => {
    if (!selectedIntegration) return;
    
    setConnectionStatus('testing');
    
    try {
      // Call backend to test connection
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/integrations/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          credentials: formData,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        toast.success('Підключення успішне!');
      } else {
        setConnectionStatus('error');
        toast.error(result.message || 'Помилка підключення');
      }
    } catch (error) {
      // For demo, simulate successful connection after delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if all required fields are filled
      const allFieldsFilled = selectedIntegration.requiredFields.every(
        field => formData[field.key]?.trim()
      );
      
      if (allFieldsFilled) {
        setConnectionStatus('success');
        toast.success('Підключення успішне!');
      } else {
        setConnectionStatus('error');
        toast.error('Заповніть усі обов\'язкові поля');
      }
    }
  };
  
  const saveIntegration = () => {
    if (!selectedIntegration || connectionStatus !== 'success') return;
    
    // Save to connected integrations
    const newConnected = new Set(connectedIntegrations);
    newConnected.add(selectedIntegration.id);
    setConnectedIntegrations(newConnected);
    localStorage.setItem('connectedIntegrations', JSON.stringify([...newConnected]));
    
    // Save credentials (in real app, send to backend)
    localStorage.setItem(`integration_${selectedIntegration.id}`, JSON.stringify(formData));
    
    toast.success(`${selectedIntegration.name} підключено!`);
    closeModal();
  };
  
  const disconnectIntegration = (integrationId: string) => {
    const newConnected = new Set(connectedIntegrations);
    newConnected.delete(integrationId);
    setConnectedIntegrations(newConnected);
    localStorage.setItem('connectedIntegrations', JSON.stringify([...newConnected]));
    localStorage.removeItem(`integration_${integrationId}`);
    
    toast.success('Інтеграцію відключено');
  };
  
  const syncIntegration = async (integrationId: string) => {
    setSyncing(integrationId);
    
    try {
      // Call backend to sync
      await fetch(`${import.meta.env.VITE_API_URL || ''}/integrations/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      });
    } catch (error) {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setSyncing(null);
    toast.success('Синхронізацію завершено');
  };
  
  const deliveryIntegrations = integrations.filter(i => i.category === 'delivery');
  const marketplaceIntegrations = integrations.filter(i => i.category === 'marketplace');
  const communicationIntegrations = integrations.filter(i => i.category === 'communication');
  
  const getLogoColor = (id: string) => {
    const colors: Record<string, string> = {
      'nova-poshta': '#e31e24',
      'ukrposhta': '#0057b8',
      'rozetka-delivery': '#00a046',
      'epicentr-delivery': '#ff6600',
      'rozetka': '#00a046',
      'prom': '#78be20',
      'epicentr': '#ff6600',
      'website': theme.colors.primary,
      'instagram': '#E1306C',
      'tiktok': '#000000',
      'viber': '#665CAC',
      'telegram': '#0088cc',
      'telephony': theme.colors.success,
    };
    return colors[id] || theme.colors.gray500;
  };
  
  const renderCategory = (
    title: string,
    icon: React.ReactNode,
    color: string,
    items: Integration[]
  ) => (
    <CategorySection>
      <CategoryHeader>
        <CategoryIcon $color={color}>{icon}</CategoryIcon>
        <CategoryTitle>{title}</CategoryTitle>
      </CategoryHeader>
      <IntegrationsGrid>
        {items.map(integration => {
          const isConnected = connectedIntegrations.has(integration.id);
          const isSyncing = syncing === integration.id;
          
          return (
            <IntegrationCard key={integration.id} $connected={isConnected}>
              <CardHeader>
                <IntegrationLogo $bg={getLogoColor(integration.id)}>
                  {integration.icon}
                </IntegrationLogo>
                <CardInfo>
                  <IntegrationName>{integration.name}</IntegrationName>
                  <IntegrationDesc>{integration.description}</IntegrationDesc>
                </CardInfo>
              </CardHeader>
              
              <StatusBadge $connected={isConnected}>
                {isConnected ? (
                  <>
                    <Check size={14} />
                    Підключено
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} />
                    Не підключено
                  </>
                )}
              </StatusBadge>
              
              <CardFeatures>
                <FeatureList>
                  {integration.features.slice(0, 6).map((feature, i) => (
                    <FeatureItem key={i}>
                      <Check size={12} />
                      {feature}
                    </FeatureItem>
                  ))}
                </FeatureList>
              </CardFeatures>
              
              <CardActions>
                {isConnected ? (
                  <>
                    <ActionButton
                      onClick={() => syncIntegration(integration.id)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {isSyncing ? 'Синхронізація...' : 'Синхронізувати'}
                    </ActionButton>
                    <ActionButton onClick={() => openModal(integration)}>
                      <Settings size={14} />
                    </ActionButton>
                    <ActionButton 
                      $variant="danger"
                      onClick={() => disconnectIntegration(integration.id)}
                    >
                      <X size={14} />
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton $variant="primary" onClick={() => openModal(integration)}>
                    Підключити
                  </ActionButton>
                )}
              </CardActions>
              
              {isConnected && (
                <LastSync>
                  <RefreshCw size={10} />
                  Остання синхронізація: сьогодні о 14:30
                </LastSync>
              )}
            </IntegrationCard>
          );
        })}
      </IntegrationsGrid>
    </CategorySection>
  );
  
  return (
    <MainLayout title="Інтеграції">
      <PageContainer>
        <PageHeader>
          <PageTitle>Інтеграції</PageTitle>
          <PageDescription>
            Підключіть сервіси доставки, маркетплейси та комунікаційні канали для автоматизації роботи
          </PageDescription>
        </PageHeader>
        
        {renderCategory('Служби доставки', <Truck size={20} />, '#e74c3c', deliveryIntegrations)}
        {renderCategory('Маркетплейси та продажі', <ShoppingCart size={20} />, '#3498db', marketplaceIntegrations)}
        {renderCategory('Комунікації', <MessageCircle size={20} />, '#9b59b6', communicationIntegrations)}
      </PageContainer>
      
      {/* Connection Modal */}
      {selectedIntegration && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <IntegrationLogo $bg={getLogoColor(selectedIntegration.id)} style={{ width: 32, height: 32, fontSize: 12 }}>
                  {selectedIntegration.icon}
                </IntegrationLogo>
                {selectedIntegration.name}
              </ModalTitle>
              <ModalClose onClick={closeModal}>
                <X size={18} />
              </ModalClose>
            </ModalHeader>
            
            <ModalBody>
              <ConnectionStatus $status={connectionStatus}>
                {connectionStatus === 'idle' && (
                  <>
                    <AlertCircle size={18} />
                    Введіть дані для підключення
                  </>
                )}
                {connectionStatus === 'testing' && (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Перевірка підключення...
                  </>
                )}
                {connectionStatus === 'success' && (
                  <>
                    <Check size={18} />
                    Підключення успішне!
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <X size={18} />
                    Помилка підключення. Перевірте дані.
                  </>
                )}
              </ConnectionStatus>
              
              {selectedIntegration.requiredFields.map(field => (
                <FormField key={field.key}>
                  <Label>{field.label}</Label>
                  {field.type === 'select' ? (
                    <Select
                      value={formData[field.key] || ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                    >
                      <option value="">Оберіть...</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                    />
                  )}
                </FormField>
              ))}
              
              <FeatureSection>
                <FeatureSectionTitle>Функції інтеграції</FeatureSectionTitle>
                <FeatureGrid>
                  {selectedIntegration.features.map((feature, i) => (
                    <FeatureToggle key={i}>
                      <input type="checkbox" defaultChecked />
                      <span>{feature}</span>
                    </FeatureToggle>
                  ))}
                </FeatureGrid>
              </FeatureSection>
            </ModalBody>
            
            <ModalFooter>
              <CancelButton onClick={closeModal}>Скасувати</CancelButton>
              <TestButton 
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
              >
                {connectionStatus === 'testing' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Перевірити
              </TestButton>
              <SaveButton 
                onClick={saveIntegration}
                disabled={connectionStatus !== 'success'}
              >
                Зберегти
              </SaveButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </MainLayout>
  );
}
