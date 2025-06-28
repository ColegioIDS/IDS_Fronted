import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/signin'); // o '/signin' si ese fuera tu path real
}
