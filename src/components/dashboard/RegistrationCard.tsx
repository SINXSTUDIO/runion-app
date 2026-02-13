'use client';

import { Link } from '@/i18n/routing';
import {
    Calendar,
    MapPin,
    Trophy,
    Download,
    ExternalLink,
    CheckCircle,
    Clock,
    XCircle,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type RegistrationCardProps = {
    registration: any;
    index: number;
};

export default function RegistrationCard({ registration, index }: RegistrationCardProps) {
    const { distance, registrationStatus, paymentStatus, bibNumber } = registration;
    const event = distance.event;

    // Status badge configuration
    const getStatusConfig = () => {
        if (registrationStatus === 'CONFIRMED') {
            return {
                label: 'Visszaigazolva',
                icon: CheckCircle,
                color: 'from-emerald-500 to-emerald-600',
                textColor: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/30',
            };
        } else if (registrationStatus === 'PENDING') {
            return {
                label: 'Függőben',
                icon: Clock,
                color: 'from-amber-500 to-amber-600',
                textColor: 'text-amber-400',
                bgColor: 'bg-amber-500/10',
                borderColor: 'border-amber-500/30',
            };
        } else if (registrationStatus === 'CANCELLED') {
            return {
                label: 'Törölve',
                icon: XCircle,
                color: 'from-red-500 to-red-600',
                textColor: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
            };
        } else {
            return {
                label: 'Teljesítve',
                icon: Trophy,
                color: 'from-purple-500 to-purple-600',
                textColor: 'text-purple-400',
                bgColor: 'bg-purple-500/10',
                borderColor: 'border-purple-500/30',
            };
        }
    };

    const getPaymentStatusConfig = () => {
        if (paymentStatus === 'PAID') {
            return { label: 'Kifizetve', color: 'text-emerald-400' };
        } else if (paymentStatus === 'UNPAID') {
            return { label: 'Fizetetlen', color: 'text-red-400' };
        } else if (paymentStatus === 'PARTIALLY_PAID') {
            return { label: 'Részben fizetve', color: 'text-amber-400' };
        } else {
            return { label: 'Visszatérítve', color: 'text-zinc-400' };
        }
    };

    const statusConfig = getStatusConfig();
    const paymentConfig = getPaymentStatusConfig();
    const StatusIcon = statusConfig.icon;

    const handleDownloadDocument = (url: string, type: string) => {
        window.open(url, '_blank');
    };

    return (
        <div
            className={`
        bg-gradient-to-br from-white/5 to-white/0 
        border border-white/10 
        rounded-3xl p-6 md:p-8
        backdrop-blur-sm
        hover:border-white/20 hover:shadow-2xl hover:shadow-accent/10
        transition-all duration-300
        animate-in slide-in-from-bottom-4 fade-in
      `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                    <span className={`text-sm font-bold ${statusConfig.textColor}`}>
                        {statusConfig.label}
                    </span>
                </div>

                {bibNumber && (
                    <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                        <span className="text-xs text-zinc-400 font-medium">Rajtszám:</span>
                        <span className="ml-2 text-lg font-black text-white">{bibNumber}</span>
                    </div>
                )}
            </div>

            {/* Event Info */}
            <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 italic group-hover:text-accent transition-colors">
                    {event.title}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-zinc-300">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium">Dátum</p>
                            <p className="font-bold">{new Date(event.eventDate).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium">Helyszín</p>
                            <p className="font-bold">{event.location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Trophy className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium">Távolság</p>
                            <p className="font-bold">{distance.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <FileText className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium">Fizetési Státusz</p>
                            <p className={`font-bold ${paymentConfig.color}`}>{paymentConfig.label}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Progress */}
            {paymentStatus !== 'PAID' && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">Fizetési állapot</span>
                        <span className="text-sm font-bold text-white">{distance.price} Ft</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${statusConfig.color} transition-all duration-500`}
                            style={{ width: paymentStatus === 'PAID' ? '100%' : '0%' }}
                        />
                    </div>
                </div>
            )}

            {/* Documents Section */}
            {(registration.invoiceUrl || registration.receiptUrl || registration.proformaUrl) && (
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <h4 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Dokumentumok</h4>
                    <div className="flex flex-wrap gap-3">
                        {registration.receiptUrl && (
                            <Button
                                onClick={() => handleDownloadDocument(registration.receiptUrl, 'Nyugta')}
                                variant="ghost"
                                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            >
                                <Download className="w-4 h-4" />
                                Nyugta
                            </Button>
                        )}
                        {registration.invoiceUrl && (
                            <Button
                                onClick={() => handleDownloadDocument(registration.invoiceUrl, 'Számla')}
                                variant="ghost"
                                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            >
                                <Download className="w-4 h-4" />
                                Számla
                            </Button>
                        )}
                        {registration.proformaUrl && (
                            <Button
                                onClick={() => handleDownloadDocument(registration.proformaUrl, 'Díjbekérő')}
                                variant="ghost"
                                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            >
                                <Download className="w-4 h-4" />
                                Díjbekérő
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href={`/races/${event.slug}/register/success?regId=${registration.id}`}
                    className="flex-1"
                >
                    <Button
                        className="w-full font-bold uppercase italic tracking-tight"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Részletek
                    </Button>
                </Link>

                {event.googleMapsUrl && (
                    <Button
                        variant="ghost"
                        onClick={() => window.open(event.googleMapsUrl, '_blank')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300"
                    >
                        <MapPin className="w-4 h-4" />
                        Térkép
                    </Button>
                )}
            </div>
        </div>
    );
}
