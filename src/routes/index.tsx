import { Link, createFileRoute } from '@tanstack/react-router';
import { Github } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useAuth } from '@/stores/auth-store';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    const { isAuthenticated } = useAuth()
    return (
        <div className='bg-background text-foreground flex min-h-screen flex-col'>
            {/* Hero Section */}
            <section className='flex flex-1 flex-col items-center justify-center px-4 py-20 text-center'>
                <h1 className='mb-4 text-4xl font-extrabold md:text-6xl'>🏴‍☠️ Raftel</h1>
                <p className='text-muted-foreground mb-6 max-w-xl text-lg md:text-xl'>
                    The Grand Line of Torrent UIs — Sail smoothly through your downloads
                    with a sleek, powerful interface for qBittorrent.
                </p>
                <div className='flex justify-center gap-4'>
                    <Button size='lg' className='px-6 py-4 text-lg' asChild>
                        {
                            isAuthenticated ? <Link to='/dashboard'>Dashboard</Link> : <Link to='/login'>Get Started</Link>
                        }
                    </Button>
                    <Button
                        size='lg'
                        variant='outline'
                        className='px-6 py-4 text-lg'
                        asChild
                    >
                        <a
                            href='https://github.com/sayeed205/raftel'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <Github className='mr-2 h-5 w-5' /> GitHub
                        </a>
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className='bg-muted text-muted-foreground px-4 py-16'>
                <div className='mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3'>
                    <Card>
                        <CardContent className='p-6'>
                            <h3 className='mb-2 text-xl font-semibold'>⚡ Fast UI</h3>
                            <p>
                                Built with React + Vite for blazing-fast interaction and
                                updates.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='p-6'>
                            <h3 className='mb-2 text-xl font-semibold'>
                                📊 Advanced Dashboard
                            </h3>
                            <p>Filter, batch, and monitor torrents in real-time with ease.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='p-6'>
                            <h3 className='mb-2 text-xl font-semibold'>
                                🧭 One Piece Inspired
                            </h3>
                            <p>
                                Navigate torrents like a pirate on the Grand Line — themed for
                                fans.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className='text-muted-foreground py-6 text-center text-sm'>
                Built with ☕ & 🍖 by{' '}
                <a href='https://github.com/sayeed205' className='underline'>
                    @sayeed205
                </a>{' '}
                • MIT Licensed
            </footer>
        </div>
    );
}
