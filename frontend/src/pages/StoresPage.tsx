import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  MapPin,
  Store,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { dataApi } from '../services/api';
import type { Store as StoreType } from '../types';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';

// ============================================
// Styled Components
// ============================================
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  margin-bottom: 24px;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const StoreCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary};
  }
`;

const StoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StoreIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primaryLight};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const StoreActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }
`;

const StoreName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px;
`;

const StoreType = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 12px;
`;

const StoreAddress = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const StoreStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.border};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color || theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: #fef3c7;
  color: #d97706;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  margin-left: 8px;
`;

// Modal Styles
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 4px;
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;

  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const SaveButton = styled.button`
  padding: 10px 24px;
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
`;

const storeTypes = [
  { value: 'store', label: 'Магазин' },
  { value: 'warehouse', label: 'Склад' },
  { value: 'office', label: 'Офіс' },
  { value: 'production', label: 'Виробництво' },
];

// ============================================
// Component
// ============================================
export default function StoresPage() {
  const { user } = useAppSelector(state => state.auth);
  const companyId = user?._client || '58c872aa3ce7d5fc688b49bd';

  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'store',
    address: '',
    description: '',
  });

  useEffect(() => {
    loadStores();
  }, [companyId]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await dataApi.getStores(companyId);
      if (response.status && response.data) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
      toast.error('Помилка завантаження магазинів');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({ name: '', type: 'store', address: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      type: store.type,
      address: store.address || '',
      description: store.description || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Введіть назву магазину');
      return;
    }
    toast.success(editingStore ? 'Магазин оновлено' : 'Магазин створено');
    closeModal();
    loadStores();
  };

  const formatPrice = (price: number) => {
    const parts = (price || 0).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  };

  const getTypeLabel = (type: string) => {
    return storeTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <MainLayout title="Магазини">
      <PageContainer>
        <Header>
          <Title>Магазини та склади</Title>
          <AddButton onClick={openCreateModal}>
            <Plus size={18} />
            Створити
          </AddButton>
        </Header>

        <SearchBar>
          <Search size={18} color="#9ca3af" />
          <input
            placeholder="Пошук магазинів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <StoresGrid>
          {filteredStores.map(store => (
            <StoreCard key={store._id} onClick={() => openEditModal(store)}>
              <StoreHeader>
                <StoreIcon>
                  <Store size={24} />
                </StoreIcon>
                <StoreActions onClick={(e) => e.stopPropagation()}>
                  <ActionButton onClick={() => openEditModal(store)}>
                    <Edit2 size={16} />
                  </ActionButton>
                  <ActionButton>
                    <Trash2 size={16} />
                  </ActionButton>
                </StoreActions>
              </StoreHeader>

              <StoreName>
                {store.name}
                {store.default && <DefaultBadge>За замовчуванням</DefaultBadge>}
              </StoreName>
              <StoreType>{getTypeLabel(store.type)}</StoreType>

              {store.address && (
                <StoreAddress>
                  <MapPin size={14} />
                  {store.address}
                </StoreAddress>
              )}

              <StoreStats>
                <StatItem>
                  <StatValue color="#10b981">
                    {formatPrice(store.balance?.income || 0)}
                  </StatValue>
                  <StatLabel>Надходження</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue color="#ef4444">
                    {formatPrice(store.balance?.outcome || 0)}
                  </StatValue>
                  <StatLabel>Витрати</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>
                    {formatPrice(store.balance?.balance || 0)}
                  </StatValue>
                  <StatLabel>Баланс</StatLabel>
                </StatItem>
              </StoreStats>
            </StoreCard>
          ))}
        </StoresGrid>

        {/* Create/Edit Modal */}
        <ModalOverlay isOpen={isModalOpen} onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingStore ? 'Редагувати магазин' : 'Новий магазин'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormField>
                <Label>Назва *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Назва магазину"
                />
              </FormField>
              <FormField>
                <Label>Тип</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  {storeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                <Label>Адреса</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Адреса магазину"
                />
              </FormField>
              <FormField>
                <Label>Опис</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Додатковий опис"
                />
              </FormField>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeModal}>Скасувати</CancelButton>
              <SaveButton onClick={handleSave}>Зберегти</SaveButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      </PageContainer>
    </MainLayout>
  );
}
