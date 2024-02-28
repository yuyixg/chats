import { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Session } from '@/types/session';
import { UserSession, saveUserSession } from '@/utils/user';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const user = (await response.json()) as UserSession;
      document.cookie = `sessionId=${user.sessionId}; path=/`;
      saveUserSession(user);
      router.push('/');
    } else {
      toast('账号或者密码错误.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' name='username' placeholder='Username' required />
      <input type='password' name='password' placeholder='Password' required />
      <button type='submit'>Login</button>
    </form>
  );
}

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {},
  };
};
