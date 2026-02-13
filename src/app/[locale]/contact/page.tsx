import { getTranslations } from 'next-intl/server';
import { Mail, Phone, MapPin, Building2, Send, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import prisma from '@/lib/prisma';

export default async function ContactPage(props: {
    params: Promise<{ locale: string }>
}) {
    const params = await props.params;
    const { locale } = params;
    const t = await getTranslations('ContactPage');

    // Fetch from DB
    const [companies, faqs] = await Promise.all([
        prisma.seller.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
        prisma.fAQ.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
    ]);

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black italic mb-6">
                        {t('title').toUpperCase()}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">

                    {/* Left Column: Organization Info */}
                    <div className="space-y-8">
                        {companies.map((company) => (
                            <Card key={company.id} className="bg-zinc-900/50 border-zinc-800 p-5 md:p-8 hover:border-accent/50 transition-colors group">
                                <div className="flex flex-col md:flex-row items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-black transition-colors self-start">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-4 w-full overflow-hidden">
                                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-accent transition-colors break-words">
                                            {company.name}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-400">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                                <span className="break-words">{company.address}</span>
                                            </div>
                                            {company.phone && <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                                                <span className="break-all">{company.phone}</span>
                                            </div>}
                                            {company.email && <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                                                <span className="break-all">{company.email}</span>
                                            </div>}
                                            {company.taxNumber && <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-500 shrink-0">Tax:</span>
                                                <span className="break-all">{company.taxNumber}</span>
                                            </div>}
                                            {company.regNumber && <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-500 shrink-0">Reg:</span>
                                                <span className="break-all">{company.regNumber}</span>
                                            </div>}
                                            {company.representative && <div className="flex items-center gap-2 col-span-full mt-2 pt-2 border-t border-zinc-800">
                                                <span className="font-semibold text-zinc-500 shrink-0">{t('representativeLabel')}:</span>
                                                <span className="font-medium text-white break-words">{company.representative}</span>
                                            </div>}

                                            {/* IBAN Section */}
                                            {company.iban && (
                                                <div className="flex items-center gap-3 col-span-full mt-2 pt-3 border-t border-zinc-800/50 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-accent/20 transition-colors overflow-hidden">
                                                    <CreditCard className="w-6 h-6 text-accent shrink-0" />
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">{t('ibanLabel')}</span>
                                                        <span className="font-mono text-white tracking-wide text-[11px] sm:text-xs md:text-sm lg:text-base font-semibold truncate">
                                                            {company.iban}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="relative">
                        <div className="sticky top-28 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Mail className="w-6 h-6 text-accent" />
                                {t('title')}
                            </h3>

                            <form className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">{t('form.name')}</label>
                                    <Input placeholder={t('form.name')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">{t('form.email')}</label>
                                    <Input type="email" placeholder={t('form.email')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">{t('form.subject')}</label>
                                    <Input placeholder={t('form.subject')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">{t('form.message')}</label>
                                    <Textarea placeholder={t('form.message')} className="min-h-[150px]" />
                                </div>

                                <Button className="w-full h-12 text-lg font-bold bg-accent text-black hover:bg-accent-hover mt-4">
                                    {t('form.submit')}
                                    <Send className="w-5 h-5 ml-2" />
                                </Button>
                            </form>
                        </div>

                    </div>

                    {/* FAQ Section */}
                    <div className="mt-24 max-w-4xl mx-auto">
                        <h3 className="text-3xl font-black mb-12 text-center text-white italic tracking-wider uppercase">
                            {t('faq.title')}
                        </h3>
                        <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq) => {
                                    let question = faq.question;
                                    let answer = faq.answer;

                                    if (locale === 'en' && faq.questionEn && faq.answerEn) {
                                        question = faq.questionEn;
                                        answer = faq.answerEn;
                                    } else if (locale === 'de' && faq.questionDe && faq.answerDe) {
                                        question = faq.questionDe;
                                        answer = faq.answerDe;
                                    }

                                    return (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                            <AccordionTrigger className="text-zinc-200 hover:text-accent text-left data-[state=open]:text-accent text-lg font-medium">
                                                {question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-zinc-400 text-base leading-relaxed whitespace-pre-wrap">
                                                {answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
