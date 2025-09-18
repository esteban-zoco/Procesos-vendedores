import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Separator } from "../components/ui/separator";
import { Check, Calendar, MapPin, Share2, Shield, Ticket, Wallet, Users, Music, Info, RefreshCw, CreditCard, QrCode, Clock, AlertTriangle, PlusCircle } from "lucide-react";

// NOTE: Este componente es un wireframe funcional y responsivo
// para una página de evento/checkout. Muestra las piezas clave
// priorizadas por arriba del pliegue (above the fold) y a lo largo
// del funnel. Todo el copy y data son placeholders.

export default function EventTicketingWireframe() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-bold">Z</div>
            <span className="text-sm text-neutral-600">Descubrí</span>
            <span className="text-sm text-neutral-300">•</span>
            <span className="text-sm text-neutral-600">Eventos</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">Iniciar sesión</Button>
            <Button size="sm" className="rounded-2xl">Crear evento</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Concierto</Badge>
                    <Badge variant="secondary" className="text-xs">18+</Badge>
                    <Badge variant="secondary" className="text-xs">Accesible</Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Artista X — Tour 2025</h1>
                  <p className="text-neutral-600 max-w-prose">Presentado por Productora Y. Cupos limitados. Preventa habilitada.</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4"/> Vie 25 Oct, 21:00</div>
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4"/> Teatro Zoco, CABA</div>
                    <div className="flex items-center gap-1"><Users className="h-4 w-4"/> 1.8k interesados</div>
                    <div className="flex items-center gap-1"><Shield className="h-4 w-4"/> Entradas seguras</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-2xl" size="sm"><Share2 className="h-4 w-4 mr-2"/>Compartir</Button>
                  <Button className="rounded-2xl" size="sm"><Calendar className="h-4 w-4 mr-2"/>Agregar al calendario</Button>
                </div>
              </div>
              <div className="mt-4 aspect-[16/9] w-full rounded-xl bg-neutral-200 grid place-items-center text-neutral-500">
                <Music className="h-8 w-8"/>
                {/* Placeholder de media */}
              </div>
            </CardContent>
          </Card>

          {/* Tickets / Selector */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5"/> Entradas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {name: "General", desc: "Acceso de pie", price: 18000, fees: 1800},
                  {name: "VIP", desc: "Acceso + zona preferencial", price: 32000, fees: 3200},
                  {name: "Palco", desc: "Asiento reservado", price: 45000, fees: 4500},
                ].map((t, i) => (
                  <Card key={i} className="rounded-xl border">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-neutral-600">{t.desc}</div>
                        </div>
                        <Badge variant="secondary">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(t.price + t.fees)} all-in</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-neutral-600">Cantidad</Label>
                        <select className="w-24 rounded-md border px-2 py-1 text-sm">
                          {[0,1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
                        </select>
                        <Button size="sm" className="ml-auto rounded-2xl">Agregar</Button>
                      </div>
                      <div className="text-[11px] text-neutral-500">Incluye impuestos y cargos (precios mostrados "all‑in" al estilo DICE).</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="fees">
                  <AccordionTrigger className="text-sm">Ver desglose de cargos</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
                      <li>Servicio: 10%</li>
                      <li>Impuestos: 21% IVA</li>
                      <li>Procesamiento de pago</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator/>

              {/* Upsell tipo Passline: consumos/beneficios */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium"><PlusCircle className="h-4 w-4"/> Agregá beneficios</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {name: "Combo bebida", price: 3500},
                    {name: "Snack pack", price: 2500},
                    {name: "Merch básico", price: 9000},
                  ].map((u, i) => (
                    <Card key={i} className="rounded-xl">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-neutral-600">Retirá en el venue</div>
                        </div>
                        <Button size="sm" variant="outline">Añadir</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info y políticas */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Información útil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="detalle">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="detalle">Detalle</TabsTrigger>
                  <TabsTrigger value="mapa">Mapa / Cómo llegar</TabsTrigger>
                  <TabsTrigger value="asientos">Mapa de asientos</TabsTrigger>
                </TabsList>
                <TabsContent value="detalle" className="pt-3 text-sm text-neutral-700">
                  <p>Puertas 19:00 • Show 21:00 • Duración 120′ • Menores de 18 con adulto responsable.</p>
                </TabsContent>
                <TabsContent value="mapa" className="pt-3">
                  <div className="aspect-[16/9] w-full rounded-xl bg-neutral-200 grid place-items-center text-neutral-500">
                    <MapPin className="h-8 w-8"/>
                  </div>
                </TabsContent>
                <TabsContent value="asientos" className="pt-3">
                  <div className="aspect-[16/9] w-full rounded-xl bg-neutral-200 grid place-items-center text-neutral-500">
                    <QrCode className="h-8 w-8"/>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Plano a modo ilustrativo.</p>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="rounded-xl"><CardContent className="p-4 text-sm flex items-start gap-2"><Shield className="h-4 w-4 mt-0.5"/> Compra protegida • Tickets nominados • Anti‑reventa</CardContent></Card>
                <Card className="rounded-xl"><CardContent className="p-4 text-sm flex items-start gap-2"><RefreshCw className="h-4 w-4 mt-0.5"/> Devolución a Lista de Espera si no podés ir (estilo DICE)</CardContent></Card>
                <Card className="rounded-xl"><CardContent className="p-4 text-sm flex items-start gap-2"><Wallet className="h-4 w-4 mt-0.5"/> Cashless & Wallet para consumos (estilo Passline)</CardContent></Card>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="pol">
                  <AccordionTrigger className="text-sm">Políticas del evento</AccordionTrigger>
                  <AccordionContent className="text-sm text-neutral-700 space-y-1">
                    <p>Reembolso: sólo si el evento se cancela o reprograma.</p>
                    <p>Transferencia: permitida hasta 24h antes, dentro de la app.</p>
                    <p>Accesibilidad: espacios reservados y baños accesibles.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Estado Sold Out / Lista de Espera (DICE-like) */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5"/> ¿Sin entradas? Únete a la Lista de Espera</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-2 text-sm text-neutral-700">
                Si se liberan tickets, te avisamos por orden de llegada. No hay reventa entre usuarios.
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="tu@email.com"/>
                <Button className="rounded-2xl">Anotarme</Button>
              </div>
            </CardContent>
          </Card>

          {/* Soporte */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> ¿Necesitás ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2 text-sm text-neutral-700">
                <p>Consulta nuestras <a className="underline" href="#">FAQs</a> o escribinos por chat 24/7.</p>
                <Textarea placeholder="Contanos tu problema..."/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="soporte-email">Email</Label>
                <div className="flex gap-2">
                  <Input id="soporte-email" placeholder="tu@email.com"/>
                  <Button className="rounded-2xl">Enviar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right / Order summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-3">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span>General x2</span><span>$39.600</span></div>
                <div className="flex items-center justify-between"><span>Servicio</span><span>$3.960</span></div>
                <div className="flex items-center justify-between"><span>Impuestos</span><span>$8.316</span></div>
                <Separator/>
                <div className="flex items-center justify-between font-medium text-base">
                  <span>Total hoy</span>
                  <span>$51.876</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                  <Check className="h-3 w-3"/> Precio final mostrado desde el inicio
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" className="rounded-2xl"><Wallet className="h-4 w-4 mr-2"/>Wallet</Button>
                  <Button className="rounded-2xl"><CreditCard className="h-4 w-4 mr-2"/>Pagar</Button>
                </div>
                <p className="text-[11px] text-neutral-500">Aceptamos tarjetas, transferencias y wallets locales.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-4 text-xs text-neutral-600 space-y-2">
                <div className="flex items-start gap-2"><Shield className="h-4 w-4 mt-0.5"/> Compra protegida</div>
                <div className="flex items-start gap-2"><RefreshCw className="h-4 w-4 mt-0.5"/> Reventa oficial / devolución a lista</div>
                <div className="flex items-start gap-2"><QrCode className="h-4 w-4 mt-0.5"/> QR dinámico anti‑fraude</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white mt-8">
        <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium mb-2">Zoco Tickets</div>
            <p className="text-neutral-600">Plataforma para productores y fans. Transparencia de precios, anti‑scalping y pagos locales.</p>
          </div>
          <div>
            <div className="font-medium mb-2">Productores</div>
            <ul className="space-y-1 text-neutral-600">
              <li>Panel de ventas en tiempo real</li>
              <li>Accesos y acreditación</li>
              <li>Cashless & Wallet</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Soporte</div>
            <ul className="space-y-1 text-neutral-600">
              <li>Centro de ayuda</li>
              <li>Términos</li>
              <li>Privacidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
