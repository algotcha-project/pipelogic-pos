import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  ChevronDown,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';

// ============================================
// Types
// ============================================
interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'viewer';
  stores?: string[];
  created: number;
  lastActive?: number;
  avatar?: string;
}

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

const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  flex: 1;
  max-width: 400px;

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

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const EmployeesTable = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.gray50};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Tr = styled.tr`
  cursor: pointer;
  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const Td = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  border-bottom: 1px solid ${theme.colors.border};
  vertical-align: middle;
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.primaryLight};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
`;

const EmployeeDetails = styled.div``;

const EmployeeName = styled.div`
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const EmployeeEmail = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const RoleBadge = styled.span<{ role: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.role) {
      case 'owner': return '#dbeafe';
      case 'admin': return '#f3e8ff';
      case 'manager': return '#dcfce7';
      case 'cashier': return '#fef3c7';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'owner': return '#1d4ed8';
      case 'admin': return '#7c3aed';
      case 'manager': return '#15803d';
      case 'cashier': return '#b45309';
      default: return '#64748b';
    }
  }};
`;

const Actions = styled.div`
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

const roles = [
  { value: 'owner', label: 'Власник' },
  { value: 'admin', label: 'Адміністратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'cashier', label: 'Касир' },
  { value: 'viewer', label: 'Переглядач' },
];

// ============================================
// Component
// ============================================
export default function EmployeesPage() {
  const { user } = useAppSelector(state => state.auth);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      _id: '1',
      name: 'Олег Кицюк',
      email: 'o_kytsuk@mail.ru',
      phone: '+380939713320',
      role: 'owner',
      created: 1489579200,
    },
    {
      _id: '2',
      name: 'Вікторія Девоніна',
      email: 'viktoriya@loveiska.com',
      phone: '+380501234567',
      role: 'cashier',
      created: 1603670400,
    },
    {
      _id: '3',
      name: 'Катерина Радіонова',
      email: 'kateryna@loveiska.com',
      phone: '+380671234567',
      role: 'cashier',
      created: 1609459200,
    },
    {
      _id: '4',
      name: 'Ліліана Модлінська',
      email: 'liliana@loveiska.com',
      phone: '+380631234567',
      role: 'manager',
      created: 1672531200,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (role: string) => roles.find(r => r.value === role)?.label || role;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', phone: '', role: 'cashier' });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Заповніть обов'язкові поля");
      return;
    }
    toast.success(editingEmployee ? 'Співробітника оновлено' : 'Співробітника додано');
    closeModal();
  };

  return (
    <MainLayout title="Співробітники">
      <PageContainer>
        <Header>
          <Title>Співробітники</Title>
          <AddButton onClick={openCreateModal}>
            <Plus size={18} />
            Додати співробітника
          </AddButton>
        </Header>

        <FiltersBar>
          <SearchInput>
            <Search size={18} color="#9ca3af" />
            <input
              placeholder="Пошук співробітників..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>
          <FilterButton>
            Роль
            <ChevronDown size={16} />
          </FilterButton>
        </FiltersBar>

        <EmployeesTable>
          <Table>
            <thead>
              <tr>
                <Th>Співробітник</Th>
                <Th>Телефон</Th>
                <Th>Роль</Th>
                <Th>Дата створення</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <Tr key={employee._id} onClick={() => openEditModal(employee)}>
                  <Td>
                    <EmployeeInfo>
                      <Avatar>{getInitials(employee.name)}</Avatar>
                      <EmployeeDetails>
                        <EmployeeName>{employee.name}</EmployeeName>
                        <EmployeeEmail>{employee.email}</EmployeeEmail>
                      </EmployeeDetails>
                    </EmployeeInfo>
                  </Td>
                  <Td>{employee.phone || '—'}</Td>
                  <Td>
                    <RoleBadge role={employee.role}>
                      <Shield size={12} />
                      {getRoleLabel(employee.role)}
                    </RoleBadge>
                  </Td>
                  <Td>{formatDate(employee.created)}</Td>
                  <Td>
                    <Actions onClick={(e) => e.stopPropagation()}>
                      <ActionButton onClick={() => openEditModal(employee)}>
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton>
                        <Trash2 size={16} />
                      </ActionButton>
                    </Actions>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </EmployeesTable>

        {/* Create/Edit Modal */}
        <ModalOverlay isOpen={isModalOpen} onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingEmployee ? 'Редагувати співробітника' : 'Новий співробітник'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormField>
                <Label>Ім'я *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ім'я співробітника"
                />
              </FormField>
              <FormField>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </FormField>
              <FormField>
                <Label>Телефон</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+380..."
                />
              </FormField>
              <FormField>
                <Label>Роль</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
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
