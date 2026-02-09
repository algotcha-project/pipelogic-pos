import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  Folder,
  FolderOpen,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppSelector } from '../hooks/useRedux';
import { dataApi } from '../services/api';
import { theme } from '../styles/GlobalStyles';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  parent?: string;
  children?: Category[];
  productsCount?: number;
}

// ============================================
// Styled Components
// ============================================
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  flex-wrap: wrap;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  min-width: 200px;

  input {
    border: none;
    outline: none;
    font-size: 14px;
    width: 100%;
    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const TotalCount = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin-left: auto;
`;

const ContentArea = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
  overflow: hidden;
`;

const CategoriesTree = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  overflow-y: auto;
  padding: 12px;
`;

const TreeItem = styled.div<{ $level: number; $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  padding-left: ${props => 12 + props.$level * 20}px;
  cursor: pointer;
  border-radius: 4px;
  background: ${props => props.$active ? theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.textPrimary};
  font-weight: ${props => props.$active ? 500 : 400};
  
  &:hover {
    background: ${props => props.$active ? theme.colors.primaryLight : '#f5f5f5'};
  }
  
  svg {
    color: ${props => props.$active ? theme.colors.primary : theme.colors.textMuted};
    flex-shrink: 0;
  }
`;

const TreeItemName = styled.span`
  flex: 1;
  font-size: 14px;
`;

const TreeItemCount = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.gray100};
  padding: 2px 8px;
  border-radius: 10px;
`;

const ExpandIcon = styled.div<{ $expanded?: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    transition: transform 0.2s;
    transform: rotate(${props => props.$expanded ? 90 : 0}deg);
  }
`;

const CategoryDetails = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  overflow-y: auto;
`;

const DetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const DetailsTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const DetailsActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 13px;
  color: ${theme.colors.textPrimary};
  
  &:hover {
    background: #f5f5f5;
  }
`;

const DeleteActionButton = styled(ActionButton)`
  color: ${theme.colors.danger};
  border-color: ${theme.colors.danger};
  
  &:hover {
    background: #fef2f2;
  }
`;

const DetailsContent = styled.div`
  padding: 20px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${theme.colors.gray50};
  border-radius: 8px;
  padding: 16px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-top: 4px;
`;

const SubcategoriesList = styled.div`
  margin-top: 24px;
`;

const SubcategoryTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  margin: 0 0 12px;
`;

const SubcategoryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const SubcategoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubcategoryInfo = styled.div`
  flex: 1;
`;

const SubcategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const SubcategoryCount = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

// Modal styles
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const ModalClose = styled.button`
  padding: 8px;
  color: ${theme.colors.textMuted};
  border-radius: 4px;
  &:hover {
    background: #f5f5f5;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
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
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid ${theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  
  &:hover {
    background: #f5f5f5;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.textMuted};
  text-align: center;
  padding: 40px;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

// ============================================
// Component
// ============================================
export default function Categories() {
  const { user } = useAppSelector(state => state.auth);
  const companyId = user?._client || '58c872aa3ce7d5fc688b49bd';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', parent: '' });

  useEffect(() => {
    loadCategories();
  }, [companyId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await dataApi.getCategories(companyId);
      if (response.status && response.data) {
        // Build tree structure
        const cats = response.data as Category[];
        const rootCategories = cats.filter(c => !c.parent);
        rootCategories.forEach(root => {
          root.children = cats.filter(c => c.parent === root._id);
          root.children.forEach(child => {
            child.children = cats.filter(c => c.parent === child._id);
          });
        });
        setCategories(rootCategories);
        
        // Select first category by default
        if (rootCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(rootCategories[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = searchQuery
    ? categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.children?.some(child => 
          child.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : categories;

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', parent: selectedCategory?._id || '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parent: category.parent || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Введіть назву категорії');
      return;
    }
    
    if (editingCategory) {
      toast.success('Категорію оновлено');
    } else {
      toast.success('Категорію створено');
    }
    closeModal();
  };

  const getAllCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const traverse = (items: Category[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) traverse(item.children);
      });
    };
    traverse(cats);
    return result;
  };

  const renderTreeItem = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = selectedCategory?._id === category._id;

    return (
      <div key={category._id}>
        <TreeItem
          $level={level}
          $active={isSelected}
          onClick={() => {
            setSelectedCategory(category);
            if (hasChildren) toggleExpanded(category._id);
          }}
        >
          {hasChildren && (
            <ExpandIcon $expanded={isExpanded}>
              <ChevronRight size={14} />
            </ExpandIcon>
          )}
          {!hasChildren && <div style={{ width: 14 }} />}
          {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
          <TreeItemName>{category.name}</TreeItemName>
          <TreeItemCount>{category.productsCount || 0}</TreeItemCount>
        </TreeItem>
        {hasChildren && isExpanded && (
          <>
            {category.children!.map(child => renderTreeItem(child, level + 1))}
          </>
        )}
      </div>
    );
  };

  const totalCount = getAllCategories(categories).length;

  return (
    <MainLayout title="Категорії">
      <PageContainer>
        <TopBar>
          <CreateButton onClick={openCreateModal}>
            <Plus size={18} />
            Створити категорію
          </CreateButton>
          <SearchInput>
            <Search size={16} color="#9ca3af" />
            <input
              placeholder="пошук"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>
          <TotalCount>Всього {totalCount} категорій</TotalCount>
        </TopBar>

        <ContentArea>
          <CategoriesTree>
            {loading ? (
              <EmptyState>Завантаження...</EmptyState>
            ) : filteredCategories.length === 0 ? (
              <EmptyState>
                <Folder size={48} />
                <div>Немає категорій</div>
              </EmptyState>
            ) : (
              filteredCategories.map(cat => renderTreeItem(cat))
            )}
          </CategoriesTree>

          <CategoryDetails>
            {selectedCategory ? (
              <>
                <DetailsHeader>
                  <DetailsTitle>{selectedCategory.name}</DetailsTitle>
                  <DetailsActions>
                    <ActionButton onClick={() => openEditModal(selectedCategory)}>
                      <Edit2 size={16} />
                      Редагувати
                    </ActionButton>
                    <DeleteActionButton>
                      <Trash2 size={16} />
                      Видалити
                    </DeleteActionButton>
                  </DetailsActions>
                </DetailsHeader>
                <DetailsContent>
                  <StatGrid>
                    <StatCard>
                      <StatValue>{selectedCategory.productsCount || 0}</StatValue>
                      <StatLabel>Товарів</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>{selectedCategory.children?.length || 0}</StatValue>
                      <StatLabel>Підкатегорій</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>0</StatValue>
                      <StatLabel>Продажів</StatLabel>
                    </StatCard>
                  </StatGrid>

                  {selectedCategory.children && selectedCategory.children.length > 0 && (
                    <SubcategoriesList>
                      <SubcategoryTitle>Підкатегорії</SubcategoryTitle>
                      {selectedCategory.children.map(child => (
                        <SubcategoryCard
                          key={child._id}
                          onClick={() => {
                            setSelectedCategory(child);
                            setExpandedCategories(prev => new Set(prev).add(selectedCategory._id));
                          }}
                        >
                          <SubcategoryIcon>
                            <Folder size={20} />
                          </SubcategoryIcon>
                          <SubcategoryInfo>
                            <SubcategoryName>{child.name}</SubcategoryName>
                            <SubcategoryCount>{child.productsCount || 0} товарів</SubcategoryCount>
                          </SubcategoryInfo>
                          <ChevronRight size={18} color={theme.colors.textMuted} />
                        </SubcategoryCard>
                      ))}
                    </SubcategoriesList>
                  )}
                </DetailsContent>
              </>
            ) : (
              <EmptyState>
                <Folder size={48} />
                <div>Виберіть категорію</div>
              </EmptyState>
            )}
          </CategoryDetails>
        </ContentArea>
      </PageContainer>

      {/* Create/Edit Modal */}
      <ModalOverlay isOpen={isModalOpen} onClick={closeModal}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
            </ModalTitle>
            <ModalClose onClick={closeModal}>
              <X size={20} />
            </ModalClose>
          </ModalHeader>
          <ModalBody>
            <FormField>
              <Label>Назва категорії *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введіть назву"
              />
            </FormField>
            <FormField>
              <Label>Батьківська категорія</Label>
              <Select
                value={formData.parent}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              >
                <option value="">Без батьківської категорії (корінь)</option>
                {getAllCategories(categories).map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </ModalBody>
          <ModalFooter>
            <CancelButton onClick={closeModal}>Скасувати</CancelButton>
            <SaveButton onClick={handleSave}>
              {editingCategory ? 'Зберегти' : 'Створити'}
            </SaveButton>
          </ModalFooter>
        </Modal>
      </ModalOverlay>
    </MainLayout>
  );
}
