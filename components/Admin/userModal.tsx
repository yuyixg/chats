import { createUser, putUser } from '@/apis/adminService';
import { GetUsersResult } from '@/types/admin';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IProps {
  user?: GetUsersResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

const ROLES = [
  {
    name: '-',
    value: '-',
  },
  {
    name: 'admin',
    value: 'admin',
  },
];

export const UserModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { user, isOpen, onClose, onSuccessful } = props;
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>(user?.role || '-');
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
    } else {
      setUsername(undefined);
      setPassword(undefined);
      setRole('-');
    }
  }, [isOpen]);

  const handleSave = () => {
    setLoading(true);
    let p = null;
    if (user) {
      p = putUser({
        id: user.id,
        username: username!,
        password: password!,
        role: role,
      });
    } else {
      p = createUser({
        username: username!,
        password: password!,
        role: role,
      });
    }
    p.then(() => {
      toast.success(t('Save successful!'));
      onSuccessful();
    })
      .catch(() => {
        toast.error(
          t(
            'Save failed! Please try again later, or contact technical personnel.'
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      backdrop='transparent'
      placement='top'
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSave}>
            <ModalHeader className='flex flex-col gap-1'>
              {user ? t('Edit User') : t('Add User')}
            </ModalHeader>
            <ModalBody>
              <Input
                required
                type='text'
                label={`${t('User Name')}`}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('User Name')}`}
                value={username}
                onValueChange={(value) => {
                  setUsername(value);
                }}
              />
              <Input
                type='text'
                label={`${t('Password')}`}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Password')}`}
                value={password}
                onValueChange={(value) => {
                  setPassword(value);
                }}
              />
              <Select
                selectedKeys={[role]}
                value={role}
                labelPlacement='outside'
                label={`${t('Select an Role')}`}
                onChange={(ev) => {
                  setRole(ev.target.value);
                }}
              >
                {ROLES.map((role) => (
                  <SelectItem key={role.name} value={role.value}>
                    {role.name}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                type='submit'
                isDisabled={!role || loading}
                color='primary'
                onClick={handleSave}
              >
                {t('Save')}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
