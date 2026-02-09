import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Check,
  Plus,
  ChevronDown,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { dataApi } from '../services/api';
import type { Store, Product, Customer, Supplier } from '../types';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';

// ============================================
// Document Types Configuration
// ============================================
const documentTypes = {
  purchase: {
    title: 'Закупівля',
    titleEn: 'purchase',
    counterpartyType: 'supplier',
    counterpartyLabel: 'Постачальник',
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
  'return-sale': {
    title: 'Повернення продажу',
    titleEn: 'return-sell',
    counterpartyType: 'client',
    counterpartyLabel: 'Клієнт',
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
  'return-purchase': {
    title: 'Повернення закупівлі',
    titleEn: 'return-purchase',
    counterpartyType: 'supplier',
    counterpartyLabel: 'Постачальник',
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
  stocktake: {
    title: 'Інвентаризація',
    titleEn: 'changes-inventory',
    counterpartyType: null,
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: false,
  },
  'stock-adjustment': {
    title: 'Оприбуткування',
    titleEn: 'changes-in',
    counterpartyType: null,
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
  'write-off': {
    title: 'Списання',
    titleEn: 'changes-out',
    counterpartyType: null,
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
  movement: {
    title: 'Переміщення',
    titleEn: 'moving',
    counterpartyType: null,
    storeFromLabel: 'Склад (звідки)',
    storeToLabel: 'Склад (куди)',
    hasOrder: true,
    hasPaid: true,
  },
  sale: {
    title: 'Продаж',
    titleEn: 'sale',
    counterpartyType: 'client',
    counterpartyLabel: 'Клієнт',
    storeLabel: 'Склад',
    hasOrder: true,
    hasPaid: true,
  },
} as const;

type DocumentType = keyof typeof documentTypes;

interface DocumentItem {
  _id: string;
  product: Product;
  qty: number;
  price: number;
  discount: number;
  total: number;
}

// ============================================
// Styled Components
// ============================================
const PageContainer = styled.div`
  display: flex;
  height: calc(100vh - 56px);
  margin: -24px;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SearchContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const FilterButton = styled.button`
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const CreateProductButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: none;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const CategoryList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const CategoryItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: ${props => props.active ? theme.colors.primaryLight : 'white'};
  border: none;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${props => props.active ? theme.colors.primary : theme.colors.textPrimary};
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const ProductCheckbox = styled.span<{ checked?: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.checked ? theme.colors.primary : '#d1d5db'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.checked ? theme.colors.primary : 'white'};
  color: white;
  font-size: 12px;
  flex-shrink: 0;
`;

const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid ${theme.colors.border};
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #219a52;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const SaveAndPrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
`;

const ToggleSwitch = styled.div<{ active: boolean }>`
  width: 44px;
  height: 24px;
  background: ${props => props.active ? theme.colors.primary : '#e5e7eb'};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${theme.colors.textPrimary};

  input {
    width: 18px;
    height: 18px;
  }
`;

const DateDisplay = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

const EditDateButton = styled.button`
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;

  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const FormContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const DocumentTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    margin: 0;
  }

  span {
    font-size: 28px;
    color: ${theme.colors.textSecondary};
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectButton = styled.button<{ hasValue?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.hasValue ? '#e8f4fd' : 'white'};
  border: 2px solid ${props => props.hasValue ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  text-align: left;

  span {
    flex: 1;
  }

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
  border-radius: 4px;
  box-shadow: ${theme.shadows.lg};
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SelectSearch = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${theme.colors.border};

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid ${theme.colors.border};
    border-radius: 4px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: ${theme.colors.primary};
    }
  }
`;

const SelectOption = styled.button<{ active?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px 16px;
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

const ProductArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SelectProductText = styled.div`
  font-size: 18px;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #9ca3af;
  }
`;

const HintText = styled.div`
  font-size: 13px;
  color: #9ca3af;
  margin-top: 8px;
`;

const HintLink = styled.span`
  color: ${theme.colors.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  border-collapse: collapse;
  margin-top: 16px;
`;

const ItemsTh = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    text-align: right;
  }
`;

const ItemsTd = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    text-align: right;
  }
`;

const QtyInput = styled.input`
  width: 80px;
  padding: 6px 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const PriceInput = styled(QtyInput)`
  width: 100px;
  text-align: right;
`;

const DeleteButton = styled.button`
  padding: 6px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;

  &:hover {
    background: #fef2f2;
    border-radius: 4px;
  }
`;

const TotalRow = styled.tr`
  background: ${theme.colors.gray50};
  font-weight: 600;

  td {
    padding: 16px;
    border-top: 2px solid ${theme.colors.border};
  }
`;

// ============================================
// Component
// ============================================
export default function DocumentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docTypeParam = searchParams.get('type') || 'purchase';
  const docType = (documentTypes[docTypeParam as DocumentType] ? docTypeParam : 'purchase') as DocumentType;
  const config = documentTypes[docType];
  
  const { user } = useAppSelector(state => state.auth);
  const companyId = user?._client || '58c872aa3ce7d5fc688b49bd';

  // Data state
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isPaid, setIsPaid] = useState(true);
  const [isOrder, setIsOrder] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedStoreTo, setSelectedStoreTo] = useState<string>('');
  const [selectedCounterparty, setSelectedCounterparty] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  // Search and dropdown state
  const [productSearch, setProductSearch] = useState('');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [storeToDropdownOpen, setStoreToDropdownOpen] = useState(false);
  const [counterpartyDropdownOpen, setCounterpartyDropdownOpen] = useState(false);
  const [counterpartySearch, setCounterpartySearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesRes, productsRes, customersRes, suppliersRes] = await Promise.all([
        dataApi.getStores(companyId),
        dataApi.getProducts(companyId, 0, 1000),
        dataApi.getCustomers(companyId, 0, 500),
        dataApi.getSuppliers(companyId),
      ]);

      if (storesRes.status && storesRes.data) {
        setStores(storesRes.data);
        if (storesRes.data.length > 0) {
          setSelectedStore(storesRes.data[0]._id);
        }
      }
      if (productsRes.status && productsRes.data) {
        setProducts(productsRes.data);
      }
      if (customersRes.status && customersRes.data) {
        setCustomers(customersRes.data);
      }
      if (suppliersRes.status && suppliersRes.data) {
        setSuppliers(suppliersRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const search = productSearch.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.barcode?.toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  // Get counterparties based on type
  const counterparties = useMemo(() => {
    if (config.counterpartyType === 'supplier') {
      return suppliers.map(s => ({ _id: s._id, name: s.name }));
    } else if (config.counterpartyType === 'client') {
      return customers.map(c => ({ _id: c._id, name: c.name }));
    }
    return [];
  }, [config.counterpartyType, suppliers, customers]);

  // Filter counterparties by search
  const filteredCounterparties = useMemo(() => {
    if (!counterpartySearch) return counterparties;
    const search = counterpartySearch.toLowerCase();
    return counterparties.filter(c => c.name?.toLowerCase().includes(search));
  }, [counterparties, counterpartySearch]);

  // Filter stores by search
  const filteredStores = useMemo(() => {
    if (!storeSearch) return stores;
    const search = storeSearch.toLowerCase();
    return stores.filter(s => s.name?.toLowerCase().includes(search));
  }, [stores, storeSearch]);

  // Toggle product selection
  const toggleProduct = (product: Product) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(product._id)) {
      newSelected.delete(product._id);
      setItems(prev => prev.filter(item => item.product._id !== product._id));
    } else {
      newSelected.add(product._id);
      const newItem: DocumentItem = {
        _id: product._id,
        product,
        qty: 1,
        price: product.price || 0,
        discount: 0,
        total: product.price || 0,
      };
      setItems(prev => [...prev, newItem]);
    }
    setSelectedProducts(newSelected);
  };

  // Update item quantity
  const updateItemQty = (itemId: string, qty: number) => {
    setItems(prev => prev.map(item => {
      if (item._id === itemId) {
        const total = qty * item.price * (1 - item.discount / 100);
        return { ...item, qty, total };
      }
      return item;
    }));
  };

  // Update item price
  const updateItemPrice = (itemId: string, price: number) => {
    setItems(prev => prev.map(item => {
      if (item._id === itemId) {
        const total = item.qty * price * (1 - item.discount / 100);
        return { ...item, price, total };
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
    const newSelected = new Set(selectedProducts);
    newSelected.delete(itemId);
    setSelectedProducts(newSelected);
  };

  // Calculate total
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  // Format price
  const formatPrice = (price: number) => {
    const parts = price.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  };

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day} ${months[now.getMonth()]}, ${hours}:${minutes}`;
  };

  // Get store name
  const getStoreName = (id: string) => stores.find(s => s._id === id)?.name || '';
  const getCounterpartyName = (id: string) => counterparties.find(c => c._id === id)?.name || '';

  // Handle save
  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Додайте хоча б один товар');
      return;
    }
    if (!selectedStore) {
      toast.error('Виберіть склад');
      return;
    }
    if (docType === 'movement' && !selectedStoreTo) {
      toast.error('Виберіть склад призначення');
      return;
    }
    
    toast.success('Документ збережено');
    navigate('/pos/movements');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setStoreDropdownOpen(false);
      setStoreToDropdownOpen(false);
      setCounterpartyDropdownOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <MainLayout title={`Створення документу / ${config.title.toLowerCase()}`}>
      <PageContainer>
        <LeftPanel>
          <SearchContainer>
            <SearchInputWrapper>
              <Search size={16} color="#9ca3af" />
              <input
                placeholder="Пошук товару"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <FilterButton>
                <Filter size={16} />
              </FilterButton>
            </SearchInputWrapper>
          </SearchContainer>

          <CreateProductButton>
            <Plus size={18} />
            Створити товар
          </CreateProductButton>

          <CategoryList>
            {filteredProducts.map(product => (
              <CategoryItem
                key={product._id}
                active={selectedProducts.has(product._id)}
                onClick={() => toggleProduct(product)}
              >
                <ProductCheckbox checked={selectedProducts.has(product._id)}>
                  {selectedProducts.has(product._id) && <Check size={12} />}
                </ProductCheckbox>
                {product.name}
              </CategoryItem>
            ))}
          </CategoryList>
        </LeftPanel>

        <MainPanel>
          <Header>
            <SaveButton onClick={handleSave} disabled={items.length === 0}>
              Зберегти
            </SaveButton>
            <SaveAndPrintButton>
              Зберегти та друкувати
              <ChevronDown size={14} />
            </SaveAndPrintButton>

            {config.hasPaid && (
              <Toggle onClick={() => setIsPaid(!isPaid)}>
                <ToggleSwitch active={isPaid} />
                Оплачено
              </Toggle>
            )}

            {config.hasOrder && (
              <Checkbox>
                <input
                  type="checkbox"
                  checked={isOrder}
                  onChange={(e) => setIsOrder(e.target.checked)}
                />
                Замовлення
              </Checkbox>
            )}

            <DateDisplay>
              {formatDate()}
              <EditDateButton>
                <Edit2 size={16} />
              </EditDateButton>
            </DateDisplay>
          </Header>

          <FormContent>
            <DocumentTitle>
              <h1>{config.title}</h1>
              <span>#{documentNumber || '—'}</span>
            </DocumentTitle>

            <FormRow>
              {/* Counterparty field (for purchase, return-sale, return-purchase) */}
              {config.counterpartyType && (
                <FormField onClick={(e) => e.stopPropagation()}>
                  <Label>{config.counterpartyLabel}</Label>
                  <SelectWrapper>
                    <SelectButton
                      hasValue={!!selectedCounterparty}
                      onClick={() => setCounterpartyDropdownOpen(!counterpartyDropdownOpen)}
                    >
                      <span>
                        {selectedCounterparty 
                          ? getCounterpartyName(selectedCounterparty) 
                          : config.counterpartyLabel}
                      </span>
                      <ChevronDown size={16} />
                    </SelectButton>
                    <SelectMenu isOpen={counterpartyDropdownOpen}>
                      <SelectSearch>
                        <input
                          placeholder="Пошук..."
                          value={counterpartySearch}
                          onChange={(e) => setCounterpartySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </SelectSearch>
                      {filteredCounterparties.map(c => (
                        <SelectOption
                          key={c._id}
                          active={selectedCounterparty === c._id}
                          onClick={() => {
                            setSelectedCounterparty(c._id);
                            setCounterpartyDropdownOpen(false);
                          }}
                        >
                          {c.name}
                        </SelectOption>
                      ))}
                    </SelectMenu>
                  </SelectWrapper>
                </FormField>
              )}

              {/* Store (from) field */}
              <FormField onClick={(e) => e.stopPropagation()}>
                <Label>{docType === 'movement' ? 'Склад (звідки)' : 'Склад'}</Label>
                <SelectWrapper>
                  <SelectButton
                    hasValue={!!selectedStore}
                    onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                  >
                    <span>
                      {selectedStore 
                        ? getStoreName(selectedStore) 
                        : 'Виберіть склад'}
                    </span>
                    <ChevronDown size={16} />
                  </SelectButton>
                  <SelectMenu isOpen={storeDropdownOpen}>
                    <SelectSearch>
                      <input
                        placeholder="Пошук..."
                        value={storeSearch}
                        onChange={(e) => setStoreSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </SelectSearch>
                    {filteredStores.map(store => (
                      <SelectOption
                        key={store._id}
                        active={selectedStore === store._id}
                        onClick={() => {
                          setSelectedStore(store._id);
                          setStoreDropdownOpen(false);
                        }}
                      >
                        {store.name}
                      </SelectOption>
                    ))}
                  </SelectMenu>
                </SelectWrapper>
              </FormField>

              {/* Store (to) field for movement */}
              {docType === 'movement' && (
                <FormField onClick={(e) => e.stopPropagation()}>
                  <Label>Склад (куди)</Label>
                  <SelectWrapper>
                    <SelectButton
                      hasValue={!!selectedStoreTo}
                      onClick={() => setStoreToDropdownOpen(!storeToDropdownOpen)}
                    >
                      <span>
                        {selectedStoreTo 
                          ? getStoreName(selectedStoreTo) 
                          : 'Пошук...'}
                      </span>
                      <ChevronDown size={16} />
                    </SelectButton>
                    <SelectMenu isOpen={storeToDropdownOpen}>
                      <SelectSearch>
                        <input
                          placeholder="Пошук..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </SelectSearch>
                      {stores.filter(s => s._id !== selectedStore).map(store => (
                        <SelectOption
                          key={store._id}
                          active={selectedStoreTo === store._id}
                          onClick={() => {
                            setSelectedStoreTo(store._id);
                            setStoreToDropdownOpen(false);
                          }}
                        >
                          {store.name}
                        </SelectOption>
                      ))}
                    </SelectMenu>
                  </SelectWrapper>
                </FormField>
              )}
            </FormRow>

            {items.length === 0 ? (
              <ProductArea>
                <SelectProductText>
                  ← Виберіть товар
                </SelectProductText>
                <HintText>
                  або <HintLink>скануйте штрих-код</HintLink>
                </HintText>
              </ProductArea>
            ) : (
              <ItemsTable>
                <thead>
                  <tr>
                    <ItemsTh>Найменування</ItemsTh>
                    <ItemsTh>Штрих-код</ItemsTh>
                    <ItemsTh>Артикул</ItemsTh>
                    <ItemsTh>Кількість</ItemsTh>
                    <ItemsTh>Ціна</ItemsTh>
                    <ItemsTh>Сума</ItemsTh>
                    <ItemsTh></ItemsTh>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      <ItemsTd>{item.product.name}</ItemsTd>
                      <ItemsTd>{item.product.barcode || '—'}</ItemsTd>
                      <ItemsTd>{item.product.sku || '—'}</ItemsTd>
                      <ItemsTd>
                        <QtyInput
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItemQty(item._id, Number(e.target.value))}
                        />
                      </ItemsTd>
                      <ItemsTd>
                        <PriceInput
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItemPrice(item._id, Number(e.target.value))}
                        />
                      </ItemsTd>
                      <ItemsTd>{formatPrice(item.total)} грн</ItemsTd>
                      <ItemsTd>
                        <DeleteButton onClick={() => removeItem(item._id)}>
                          <Trash2 size={18} />
                        </DeleteButton>
                      </ItemsTd>
                    </tr>
                  ))}
                  <TotalRow>
                    <td colSpan={3}>Разом</td>
                    <td>{items.reduce((sum, i) => sum + i.qty, 0)}</td>
                    <td></td>
                    <td>{formatPrice(total)} грн</td>
                    <td></td>
                  </TotalRow>
                </tbody>
              </ItemsTable>
            )}
          </FormContent>
        </MainPanel>
      </PageContainer>
    </MainLayout>
  );
}
