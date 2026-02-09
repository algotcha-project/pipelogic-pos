import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { dataApi } from '../services/api';
import type { Account, Customer, Store } from '../types';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// ============================================
// Types
// ============================================
type MovementType = 'income' | 'expense' | 'transfer';

interface Counterparty {
  _id: string;
  name: string;
  type: 'customer' | 'supplier' | 'store';
}

// ============================================
// Styled Components
// ============================================
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const TypeTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
`;

const TypeTab = styled.button<{ active?: boolean; type: MovementType }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  ${props => {
    const colors = {
      income: { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
      expense: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' },
      transfer: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
    };
    const c = colors[props.type];
    return props.active
      ? `background: ${c.bg}; border-color: ${c.border}; color: ${c.text};`
      : `background: white; border-color: ${theme.colors.border}; color: ${theme.colors.textSecondary}; &:hover { background: #f9fafb; }`;
  }}
`;

const FormCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 32px;
`;

const FormSection = styled.div`
  margin-bottom: 28px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  margin: 0 0 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 15px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const AmountInput = styled.input<{ $movementType: MovementType }>`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 28px;
  font-weight: 700;
  text-align: center;

  ${props => {
    const colors = {
      income: '#22c55e',
      expense: '#ef4444',
      transfer: '#3b82f6',
    };
    return `
      color: ${colors[props.$movementType]};
      &:focus {
        outline: none;
        border-color: ${colors[props.$movementType]};
      }
    `;
  }}
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const SelectMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  box-shadow: ${theme.shadows.lg};
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SelectOption = styled.button<{ active?: boolean }>`
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.active ? theme.colors.primaryLight : 'white'};
  border: none;
  font-size: 14px;
  color: ${props => props.active ? theme.colors.primary : theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const SelectGroup = styled.div`
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.gray50};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const SaveButton = styled.button<{ type: MovementType }>`
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: white;

  ${props => {
    const colors = {
      income: { bg: '#22c55e', hover: '#16a34a' },
      expense: { bg: '#ef4444', hover: '#dc2626' },
      transfer: { bg: '#3b82f6', hover: '#2563eb' },
    };
    const c = colors[props.type];
    return `
      background: ${c.bg};
      &:hover { background: ${c.hover}; }
    `;
  }}
`;

const ArrowIcon = styled.div<{ type: MovementType }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  ${props => {
    const colors = {
      income: { bg: '#dcfce7', color: '#22c55e' },
      expense: { bg: '#fee2e2', color: '#ef4444' },
      transfer: { bg: '#dbeafe', color: '#3b82f6' },
    };
    const c = colors[props.type];
    return `background: ${c.bg}; color: ${c.color};`;
  }}
`;

const categories = {
  income: [
    'Оплата від клієнта',
    'Повернення від постачальника',
    'Інші надходження',
    'Позика',
    'Інвестиції',
  ],
  expense: [
    'Оплата постачальнику',
    'Повернення клієнту',
    'Оренда',
    'Зарплата',
    'Комунальні',
    'Реклама',
    'Інші витрати',
  ],
  transfer: ['Переказ між рахунками'],
};

// ============================================
// Component
// ============================================
export default function MoneyMovementCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'income';
  const initialType: MovementType = ['income', 'expense', 'transfer'].includes(typeParam) 
    ? typeParam as MovementType 
    : 'income';

  const { user } = useAppSelector(state => state.auth);
  const companyId = user?._client || '58c872aa3ce7d5fc688b49bd';

  const [movementType, setMovementType] = useState<MovementType>(initialType);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Dropdowns
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsRes, customersRes, suppliersRes] = await Promise.all([
        dataApi.getAccounts(companyId),
        dataApi.getCustomers(companyId, 0, 200),
        dataApi.getSuppliers(companyId),
      ]);

      if (accountsRes.status && accountsRes.data) {
        setAccounts(accountsRes.data);
        if (accountsRes.data.length > 0) {
          setFromAccount(accountsRes.data[0]._id);
        }
      }
      if (customersRes.status && customersRes.data) {
        setCustomers(customersRes.data);
      }
      if (suppliersRes.status && suppliersRes.data) {
        setSuppliers(suppliersRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const counterparties: Counterparty[] = useMemo(() => {
    const result: Counterparty[] = [];
    customers.forEach(c => result.push({ _id: c._id, name: c.name, type: 'customer' }));
    suppliers.forEach(s => result.push({ _id: s._id, name: s.name, type: 'supplier' }));
    return result;
  }, [customers, suppliers]);

  const getAccountName = (id: string) => accounts.find(a => a._id === id)?.name || 'Виберіть рахунок';
  const getCounterpartyName = (id: string) => counterparties.find(c => c._id === id)?.name || 'Виберіть контрагента';

  const getTitle = () => {
    switch (movementType) {
      case 'income': return 'Прихід грошей';
      case 'expense': return 'Витрата грошей';
      case 'transfer': return 'Переказ між рахунками';
    }
  };

  const getIcon = () => {
    switch (movementType) {
      case 'income': return <ArrowDownLeft size={24} />;
      case 'expense': return <ArrowUpRight size={24} />;
      case 'transfer': return <ArrowLeftRight size={24} />;
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Введіть суму');
      return;
    }
    if (!fromAccount) {
      toast.error('Виберіть рахунок');
      return;
    }
    if (movementType === 'transfer' && !toAccount) {
      toast.error('Виберіть рахунок призначення');
      return;
    }

    toast.success('Операцію збережено');
    navigate('/pos/money');
  };

  return (
    <MainLayout title={getTitle()}>
      <PageContainer>
        <Header>
          <Title>{getTitle()}</Title>
        </Header>

        <TypeTabs>
          <TypeTab
            type="income"
            active={movementType === 'income'}
            onClick={() => setMovementType('income')}
          >
            <ArrowDownLeft size={18} />
            Прихід
          </TypeTab>
          <TypeTab
            type="expense"
            active={movementType === 'expense'}
            onClick={() => setMovementType('expense')}
          >
            <ArrowUpRight size={18} />
            Витрата
          </TypeTab>
          <TypeTab
            type="transfer"
            active={movementType === 'transfer'}
            onClick={() => setMovementType('transfer')}
          >
            <ArrowLeftRight size={18} />
            Переказ
          </TypeTab>
        </TypeTabs>

        <FormCard>
          <ArrowIcon type={movementType}>{getIcon()}</ArrowIcon>

          <FormField>
            <Label>Сума, ₴</Label>
            <AmountInput
              $movementType={movementType}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </FormField>

          <FormSection>
            <SectionTitle>Деталі операції</SectionTitle>
            <FormRow>
              <FormField>
                <Label>{movementType === 'transfer' ? 'Рахунок списання' : 'Рахунок'}</Label>
                <SelectWrapper>
                  <SelectButton onClick={() => setOpenDropdown(openDropdown === 'from' ? null : 'from')}>
                    {getAccountName(fromAccount)}
                    <ChevronDown size={16} />
                  </SelectButton>
                  <SelectMenu isOpen={openDropdown === 'from'}>
                    {accounts.map(acc => (
                      <SelectOption
                        key={acc._id}
                        active={fromAccount === acc._id}
                        onClick={() => { setFromAccount(acc._id); setOpenDropdown(null); }}
                      >
                        {acc.name}
                      </SelectOption>
                    ))}
                  </SelectMenu>
                </SelectWrapper>
              </FormField>

              {movementType === 'transfer' ? (
                <FormField>
                  <Label>Рахунок зарахування</Label>
                  <SelectWrapper>
                    <SelectButton onClick={() => setOpenDropdown(openDropdown === 'to' ? null : 'to')}>
                      {getAccountName(toAccount)}
                      <ChevronDown size={16} />
                    </SelectButton>
                    <SelectMenu isOpen={openDropdown === 'to'}>
                      {accounts.filter(a => a._id !== fromAccount).map(acc => (
                        <SelectOption
                          key={acc._id}
                          active={toAccount === acc._id}
                          onClick={() => { setToAccount(acc._id); setOpenDropdown(null); }}
                        >
                          {acc.name}
                        </SelectOption>
                      ))}
                    </SelectMenu>
                  </SelectWrapper>
                </FormField>
              ) : (
                <FormField>
                  <Label>Контрагент</Label>
                  <SelectWrapper>
                    <SelectButton onClick={() => setOpenDropdown(openDropdown === 'counter' ? null : 'counter')}>
                      {getCounterpartyName(counterparty)}
                      <ChevronDown size={16} />
                    </SelectButton>
                    <SelectMenu isOpen={openDropdown === 'counter'}>
                      <SelectGroup>Клієнти</SelectGroup>
                      {customers.slice(0, 20).map(c => (
                        <SelectOption
                          key={c._id}
                          active={counterparty === c._id}
                          onClick={() => { setCounterparty(c._id); setOpenDropdown(null); }}
                        >
                          {c.name}
                        </SelectOption>
                      ))}
                      <SelectGroup>Постачальники</SelectGroup>
                      {suppliers.slice(0, 20).map(s => (
                        <SelectOption
                          key={s._id}
                          active={counterparty === s._id}
                          onClick={() => { setCounterparty(s._id); setOpenDropdown(null); }}
                        >
                          {s.name}
                        </SelectOption>
                      ))}
                    </SelectMenu>
                  </SelectWrapper>
                </FormField>
              )}
            </FormRow>

            <FormRow>
              <FormField>
                <Label>Категорія</Label>
                <SelectWrapper>
                  <SelectButton onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}>
                    {category || 'Виберіть категорію'}
                    <ChevronDown size={16} />
                  </SelectButton>
                  <SelectMenu isOpen={openDropdown === 'category'}>
                    {categories[movementType].map(cat => (
                      <SelectOption
                        key={cat}
                        active={category === cat}
                        onClick={() => { setCategory(cat); setOpenDropdown(null); }}
                      >
                        {cat}
                      </SelectOption>
                    ))}
                  </SelectMenu>
                </SelectWrapper>
              </FormField>

              <FormField>
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormField>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Коментар</SectionTitle>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Додатковий опис операції..."
            />
          </FormSection>

          <ButtonsRow>
            <CancelButton onClick={() => navigate('/pos/money')}>
              Скасувати
            </CancelButton>
            <SaveButton type={movementType} onClick={handleSave}>
              Зберегти
            </SaveButton>
          </ButtonsRow>
        </FormCard>
      </PageContainer>
    </MainLayout>
  );
}
