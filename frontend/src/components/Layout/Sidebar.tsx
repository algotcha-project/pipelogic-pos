import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  RefreshCw,
  DollarSign,
  BarChart2,
  Users,
  Building2,
  ShoppingBag,
  Gift,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Link2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import { theme } from '../../styles/GlobalStyles';

const SidebarContainer = styled.aside`
  width: 240px;
  height: 100vh;
  background: white;
  border-right: 1px solid ${theme.colors.border};
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 12px 16px;
  background: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
`;

const CreateButtonWrapper = styled.div`
  position: relative;
  margin: 16px;
`;

const CreateButton = styled.button`
  padding: 12px 20px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e67e22;
  }
`;

const CreateDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  box-shadow: ${theme.shadows.lg};
  z-index: 300;
  display: ${props => props.isOpen ? 'block' : 'none'};
  overflow: hidden;
`;

const CreateDropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: none;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.primary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const NavSection = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray300};
    border-radius: 2px;
  }
`;

const NavItem = styled(NavLink)<{ $indent?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  padding-left: ${props => props.$indent ? '44px' : '12px'};
  color: ${theme.colors.textSecondary};
  transition: all 0.2s ease;
  font-size: 14px;
  border-radius: 6px;
  margin-bottom: 2px;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }

  &.active {
    background: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  width: 100%;
  color: ${theme.colors.textSecondary};
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 2px;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  span {
    flex: 1;
  }

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }
`;

const SubNav = styled.div<{ isExpanded: boolean }>`
  overflow: hidden;
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  transition: max-height 0.3s ease;
`;

const SubNavItem = styled(NavLink)`
  display: block;
  padding: 8px 12px 8px 44px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 2px;

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }

  &.active {
    background: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: 12px 16px;
`;

const Footer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  gap: 8px;
`;

const FooterIcon = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textMuted};
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.textPrimary};
  }
`;

const BadgeNew = styled.span`
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
`;

const documentTypes = [
  { id: 'sale', label: 'Продаж' },
  { id: 'purchase', label: 'Закупівля' },
  { id: 'return-sale', label: 'Повернення продажу' },
  { id: 'return-purchase', label: 'Повернення закупівлі' },
  { id: 'stocktake', label: 'Інвентаризація' },
  { id: 'stock-adjustment', label: 'Оприбуткування' },
  { id: 'write-off', label: 'Списання' },
  { id: 'movement', label: 'Переміщення' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    registers: false,
    counterparties: false,
    company: false,
  });
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-create-dropdown]')) {
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo>AinurPOS</Logo>
      </SidebarHeader>

      <CreateButtonWrapper data-create-dropdown>
        <CreateButton onClick={() => setCreateDropdownOpen(!createDropdownOpen)}>
          Створити документ
        </CreateButton>
        <CreateDropdown isOpen={createDropdownOpen}>
          {documentTypes.map(dt => (
            <CreateDropdownItem
              key={dt.id}
              onClick={() => {
                navigate(`/pos/documents/new?type=${dt.id}`);
                setCreateDropdownOpen(false);
              }}
            >
              {dt.label}
            </CreateDropdownItem>
          ))}
        </CreateDropdown>
      </CreateButtonWrapper>

      <NavSection>
        <NavItem to="/pos" end>
          <LayoutGrid size={20} />
          Головна
        </NavItem>
        
        <NavItem to="/pos/products">
          <Package size={20} />
          Товари та послуги
        </NavItem>

        <NavButton onClick={() => toggleSection('registers')}>
          <ShoppingCart size={20} />
          <span>Каси та зміни</span>
          {expandedSections.registers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </NavButton>
        <SubNav isExpanded={expandedSections.registers}>
          <SubNavItem to="/pos/shifts">Зміни</SubNavItem>
          <SubNavItem to="/pos/registers">Каси</SubNavItem>
          <SubNavItem to="/pos/cashier">Завантажити програму</SubNavItem>
        </SubNav>

        <NavItem to="/pos/movements">
          <RefreshCw size={20} />
          Рух товару
        </NavItem>
        
        <NavItem to="/pos/money">
          <DollarSign size={20} />
          Рух грошей
        </NavItem>
        
        <NavItem to="/pos/reports">
          <BarChart2 size={20} />
          Звіти
        </NavItem>

        <NavButton onClick={() => toggleSection('counterparties')}>
          <Users size={20} />
          <span>Контрагенти</span>
          {expandedSections.counterparties ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </NavButton>
        <SubNav isExpanded={expandedSections.counterparties}>
          <SubNavItem to="/pos/suppliers">Постачальники</SubNavItem>
          <SubNavItem to="/pos/customers">Клієнти</SubNavItem>
        </SubNav>

        <NavButton onClick={() => toggleSection('company')}>
          <Building2 size={20} />
          <span>Компанія</span>
          {expandedSections.company ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </NavButton>
        <SubNav isExpanded={expandedSections.company}>
          <SubNavItem to="/pos/settings">Налаштування</SubNavItem>
          <SubNavItem to="/pos/employees">Співробітники</SubNavItem>
          <SubNavItem to="/pos/stores">Магазини</SubNavItem>
          <SubNavItem to="/pos/accounts">Рахунки</SubNavItem>
          <SubNavItem to="/pos/loyalty">Лояльність</SubNavItem>
          <SubNavItem to="/pos/print-forms">Друковані форми</SubNavItem>
          <SubNavItem to="/pos/integrations">Інтеграції</SubNavItem>
        </SubNav>
        
        <NavItem to="/pos/cart" style={{ color: theme.colors.textMuted }}>
          <ShoppingBag size={20} />
          Кошик
        </NavItem>

        <Divider />

        <NavItem to="/pos/whats-new">
          <Gift size={20} />
          Що нового
          <BadgeNew>3</BadgeNew>
        </NavItem>
        
        <NavItem to="/pos/knowledge-base">
          <HelpCircle size={20} />
          База знань
        </NavItem>
      </NavSection>
    </SidebarContainer>
  );
}
