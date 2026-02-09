import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  DollarSign,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { dataApi } from '../services/api';
import type { Account } from '../types';
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

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 20px;
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const SummaryValue = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || theme.colors.textPrimary};
`;

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const AccountCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary};
  }
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const AccountIcon = styled.div<{ color?: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.color || theme.colors.primaryLight};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const AccountActions = styled.div`
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

const AccountName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px;
`;

const AccountType = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const AccountBalance = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const AccountStats = styled.div`
  display: flex;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
`;

const StatItem = styled.div`
  flex: 1;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color || theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${theme.colors.textMuted};
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
`;

const accountTypes = [
  { value: 'cash', label: 'Готівка', icon: Wallet, color: '#dcfce7' },
  { value: 'bank_account', label: 'Банківський рахунок', icon: Building2, color: '#dbeafe' },
  { value: 'card', label: 'Картка', icon: CreditCard, color: '#fef3c7' },
  { value: 'online', label: 'Онлайн', icon: Smartphone, color: '#f3e8ff' },
  { value: 'terminal', label: 'Термінал', icon: CreditCard, color: '#fce7f3' },
  { value: 'other', label: 'Інший', icon: DollarSign, color: '#f1f5f9' },
];

// ============================================
// Component
// ============================================
export default function AccountsPage() {
  const { user } = useAppSelector(state => state.auth);
  const companyId = user?._client || '58c872aa3ce7d5fc688b49bd';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
  });

  useEffect(() => {
    loadAccounts();
  }, [companyId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await dataApi.getAccounts(companyId);
      if (response.status && response.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    const parts = (price || 0).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance?.balance || 0), 0);
  const totalIncome = accounts.reduce((sum, acc) => sum + (acc.balance?.income || 0), 0);
  const totalOutcome = accounts.reduce((sum, acc) => sum + (acc.balance?.outcome || 0), 0);

  const getAccountTypeInfo = (type: string) => {
    return accountTypes.find(t => t.value === type) || accountTypes[5];
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({ name: '', type: 'cash' });
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({ name: account.name, type: account.type });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Введіть назву рахунку');
      return;
    }
    toast.success(editingAccount ? 'Рахунок оновлено' : 'Рахунок створено');
    closeModal();
    loadAccounts();
  };

  return (
    <MainLayout title="Рахунки">
      <PageContainer>
        <Header>
          <Title>Рахунки</Title>
          <AddButton onClick={openCreateModal}>
            <Plus size={18} />
            Створити рахунок
          </AddButton>
        </Header>

        <SummaryCards>
          <SummaryCard>
            <SummaryLabel>Загальний баланс</SummaryLabel>
            <SummaryValue>{formatPrice(totalBalance)} ₴</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Всього надходжень</SummaryLabel>
            <SummaryValue color="#10b981">{formatPrice(totalIncome)} ₴</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Всього витрат</SummaryLabel>
            <SummaryValue color="#ef4444">{formatPrice(totalOutcome)} ₴</SummaryValue>
          </SummaryCard>
        </SummaryCards>

        <AccountsGrid>
          {accounts.map(account => {
            const typeInfo = getAccountTypeInfo(account.type);
            const IconComponent = typeInfo.icon;
            return (
              <AccountCard key={account._id} onClick={() => openEditModal(account)}>
                <AccountHeader>
                  <AccountIcon color={typeInfo.color}>
                    <IconComponent size={24} />
                  </AccountIcon>
                  <AccountActions onClick={(e) => e.stopPropagation()}>
                    <ActionButton onClick={() => openEditModal(account)}>
                      <Edit2 size={16} />
                    </ActionButton>
                    <ActionButton>
                      <Trash2 size={16} />
                    </ActionButton>
                  </AccountActions>
                </AccountHeader>

                <AccountName>{account.name}</AccountName>
                <AccountType>{typeInfo.label}</AccountType>
                <AccountBalance>{formatPrice(account.balance?.balance || 0)} ₴</AccountBalance>

                <AccountStats>
                  <StatItem>
                    <StatValue color="#10b981">+{formatPrice(account.balance?.income || 0)}</StatValue>
                    <StatLabel>Надходження</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#ef4444">-{formatPrice(account.balance?.outcome || 0)}</StatValue>
                    <StatLabel>Витрати</StatLabel>
                  </StatItem>
                </AccountStats>
              </AccountCard>
            );
          })}
        </AccountsGrid>

        {/* Create/Edit Modal */}
        <ModalOverlay isOpen={isModalOpen} onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingAccount ? 'Редагувати рахунок' : 'Новий рахунок'}
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
                  placeholder="Назва рахунку"
                />
              </FormField>
              <FormField>
                <Label>Тип</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
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
