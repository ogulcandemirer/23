import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction, TransactionType } from '../../contexts/expense-tracker.context';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background 0.2s;
  &:hover { background: #e2e8f0; }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const TypeToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
`;

const TypeBtn = styled.button<{ $active: boolean; $type: 'income' | 'expense' }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active, $type }) =>
    $active ? ($type === 'income' ? '#10B981' : '#EF4444') : 'transparent'};
  color: ${({ $active, $type }) =>
    $active ? '#fff' : ($type === 'income' ? '#10B981' : '#EF4444')};
  box-shadow: ${({ $active }) => $active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  &::placeholder { color: #94a3b8; }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  &:focus {
    outline: none;
    border-color: #6366f1;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const AmountWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
`;

const AmountInput = styled(Input)`
  padding-left: 30px;
  font-weight: 700;
  font-size: 1.125rem;
`;

const ModalFooter = styled.div`
  padding: 0 24px 24px;
  display: flex;
  gap: 10px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #f1f5f9; }
`;

const SubmitBtn = styled.button<{ $type: 'income' | 'expense' }>`
  flex: 2;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: ${({ $type }) => $type === 'income' ? '#10B981' : '#6366F1'};
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { filter: brightness(1.08); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

type Props = {
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
};

export default function TransactionModal({ onClose, onSubmit, initialData }: Props) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!categories.includes(category)) setCategory('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !category || !date) return;
    onSubmit({ type, category, amount: amt, description: description.trim(), date });
    onClose();
  }

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Modal>
        <ModalHeader>
          <ModalTitle>{initialData ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</ModalTitle>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <TypeToggle>
              <TypeBtn type="button" $active={type === 'income'} $type="income" onClick={() => setType('income')}>
                ↑ Gelir
              </TypeBtn>
              <TypeBtn type="button" $active={type === 'expense'} $type="expense" onClick={() => setType('expense')}>
                ↓ Gider
              </TypeBtn>
            </TypeToggle>

            <FormGroup>
              <Label>Tutar</Label>
              <AmountWrapper>
                <CurrencySymbol>₺</CurrencySymbol>
                <AmountInput
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  autoFocus
                />
              </AmountWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Kategori</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Kategori seçin...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Açıklama</Label>
              <Input
                type="text"
                placeholder="İşlem açıklaması..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label>Tarih</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <CancelBtn type="button" onClick={onClose}>İptal</CancelBtn>
            <SubmitBtn type="submit" $type={type}>
              {initialData ? 'Güncelle' : '+ Ekle'}
            </SubmitBtn>
          </ModalFooter>
        </form>
      </Modal>
    </Overlay>
  );
}
