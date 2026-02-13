'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { toast } from 'sonner';
import { updateTransferSettings } from '@/actions/settings';
import { Save, Loader2, LayoutDashboard, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface HomepageSettingsFormProps {
    initialSettings: {
        featuredEventId?: string | null;
        featuredEventActive?: boolean;
        featuredEventTitleHU?: string | null;
        featuredEventTitleEN?: string | null;
        featuredEventTitleDE?: string | null;
        featuredEventDescriptionHU?: string | null;
        featuredEventDescriptionEN?: string | null;
        featuredEventDescriptionDE?: string | null;
        featuredEventButtonHU?: string | null;
        featuredEventButtonEN?: string | null;
        featuredEventButtonDE?: string | null;
    };
    events: any[];
}

export default function HomepageSettingsForm({ initialSettings, events = [] }: HomepageSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        featuredEventId: initialSettings.featuredEventId || '',
        featuredEventActive: initialSettings.featuredEventActive || false,
        featuredEventTitleHU: initialSettings.featuredEventTitleHU || '',
        featuredEventTitleEN: initialSettings.featuredEventTitleEN || '',
        featuredEventTitleDE: initialSettings.featuredEventTitleDE || '',
        featuredEventDescriptionHU: initialSettings.featuredEventDescriptionHU || '',
        featuredEventDescriptionEN: initialSettings.featuredEventDescriptionEN || '',
        featuredEventDescriptionDE: initialSettings.featuredEventDescriptionDE || '',
        featuredEventButtonHU: initialSettings.featuredEventButtonHU || '',
        featuredEventButtonEN: initialSettings.featuredEventButtonEN || '',
        featuredEventButtonDE: initialSettings.featuredEventButtonDE || '',
    });

    const handleToggle = (checked: boolean) => {
        setFormData(prev => ({ ...prev, featuredEventActive: checked }));
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, featuredEventId: e.target.value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateTransferSettings(formData);
            if (result.success) {
                toast.success('Főoldali beállítások sikeresen mentve!');
            } else {
                toast.error('Hiba történt a mentés során: ' + result.error);
            }
        } catch (error) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, value, type = 'text', placeholder = '' }: any) => (
        <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
            />
        </div>
    );

    const TextAreaField = ({ label, name, value, placeholder = '' }: any) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:outline-none transition-colors resize-none"
            />
        </div>
    );

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-white uppercase italic">Főoldali Kiemelt Esemény</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between p-5 bg-black rounded-2xl border border-zinc-800 shadow-sm">
                    <div className="space-y-1">
                        <h4 className="font-bold text-white italic uppercase tracking-tighter">Manuális Kiemelés Bekapcsolása</h4>
                        <p className="text-sm text-zinc-500">
                            Ha aktív, az alább kiválasztott esemény jelenik meg. Ha kikapcsolod, automatikusan a legközelebbi verseny kerül a főoldalra.
                        </p>
                    </div>
                    <Switch
                        checked={formData.featuredEventActive}
                        onCheckedChange={handleToggle}
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest italic ml-1">
                        Kiemelendő Esemény Kiválasztása
                    </label>
                    <div className="relative">
                        <select
                            value={formData.featuredEventId}
                            onChange={handleSelect}
                            disabled={!formData.featuredEventActive}
                            className={`flex h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        >
                            <option value="">-- Válassz eseményt --</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>
                                    {event.title} ({format(new Date(event.eventDate), 'yyyy. MM. dd.', { locale: hu })})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Customizable Texts */}
                <div className="space-y-8 pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase italic tracking-tighter text-lg">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        Egyedi Szövegek Felülírása
                        <span className="text-[10px] text-zinc-500 ml-2 not-italic font-normal">(opcionális - ha üres, a verseny adatai jelennek meg)</span>
                    </div>

                    {/* Titles */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold text-accent uppercase tracking-widest italic ml-1">Címek (Title)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="HU - Magyar" name="featuredEventTitleHU" value={formData.featuredEventTitleHU} placeholder="X. Schiller Szerelmes Füred" />
                            <InputField label="EN - English" name="featuredEventTitleEN" value={formData.featuredEventTitleEN} />
                            <InputField label="DE - Deutsch" name="featuredEventTitleDE" value={formData.featuredEventTitleDE} />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold text-accent uppercase tracking-widest italic ml-1">Leírások (Short Description)</h5>
                        <div className="grid grid-cols-1 gap-4">
                            <TextAreaField label="HU - Magyar" name="featuredEventDescriptionHU" value={formData.featuredEventDescriptionHU} placeholder="Kutasd fel életed párját a Balaton partján..." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextAreaField label="EN - English" name="featuredEventDescriptionEN" value={formData.featuredEventDescriptionEN} />
                                <TextAreaField label="DE - Deutsch" name="featuredEventDescriptionDE" value={formData.featuredEventDescriptionDE} />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold text-accent uppercase tracking-widest italic ml-1">Gomb Szövegek (Button Label)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="HU - Magyar" name="featuredEventButtonHU" value={formData.featuredEventButtonHU} placeholder="Infópakk megtekintése" />
                            <InputField label="EN - English" name="featuredEventButtonEN" value={formData.featuredEventButtonEN} />
                            <InputField label="DE - Deutsch" name="featuredEventButtonDE" value={formData.featuredEventButtonDE} />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto bg-accent hover:bg-accent/80 text-black font-black uppercase italic px-10 py-6 rounded-xl shadow-lg transform transition-all active:scale-95 shadow-accent/10">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Beállítások Mentése
                    </Button>
                </div>
            </form>
        </Card>
    );
}
