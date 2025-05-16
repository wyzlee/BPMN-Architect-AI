'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';

export function TeamworkThemeDemo() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-teamwork-primary">Charte Graphique TeamWork</h1>
        <p className="text-teamwork-neutral-3">Démonstration des composants avec la nouvelle charte graphique</p>
      </div>

      <Tabs defaultValue="couleurs" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="couleurs">Couleurs</TabsTrigger>
          <TabsTrigger value="composants">Composants</TabsTrigger>
          <TabsTrigger value="boutons">Boutons</TabsTrigger>
          <TabsTrigger value="cartes">Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="couleurs" className="space-y-6">
          <h2 className="text-2xl font-semibold">Palette de couleurs</h2>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Couleurs Primaires</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-md bg-teamwork-primary text-white">
                <div className="font-bold">Bleu Foncé TeamWork</div>
                <div className="text-sm opacity-80">#162049</div>
              </div>
              <div className="p-6 rounded-md bg-teamwork-primary-light text-white">
                <div className="font-bold">Bleu Clair TeamWork</div>
                <div className="text-sm opacity-80">#0097DD</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Couleurs Neutres</h3>
            <div className="grid grid-cols-7 gap-2">
              <div className="p-4 rounded-md bg-teamwork-neutral-1 text-white text-center">
                <div className="text-xs font-medium">Neutre 1</div>
                <div className="text-xs opacity-80">#282832</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-2 text-white text-center">
                <div className="text-xs font-medium">Neutre 2</div>
                <div className="text-xs opacity-80">#444752</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-3 text-white text-center">
                <div className="text-xs font-medium">Neutre 3</div>
                <div className="text-xs opacity-80">#747480</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-4 text-white text-center">
                <div className="text-xs font-medium">Neutre 4</div>
                <div className="text-xs opacity-80">#9e9ea6</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-5 text-teamwork-neutral-1 text-center">
                <div className="text-xs font-medium">Neutre 5</div>
                <div className="text-xs opacity-80">#d4d4d6</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-6 text-teamwork-neutral-1 text-center">
                <div className="text-xs font-medium">Neutre 6</div>
                <div className="text-xs opacity-80">#f2f2f3</div>
              </div>
              <div className="p-4 rounded-md bg-teamwork-neutral-7 text-teamwork-neutral-1 text-center">
                <div className="text-xs font-medium">Neutre 7</div>
                <div className="text-xs opacity-80">#fafafa</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Dégradés</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-md bg-teamwork-gradient text-white">
                <div className="font-bold">Dégradé Principal</div>
                <div className="text-sm opacity-80">#162049 → #0097DD</div>
              </div>
              <div className="p-6 rounded-md bg-teamwork-gradient-reverse text-white">
                <div className="font-bold">Dégradé Inversé</div>
                <div className="text-sm opacity-80">#0097DD → #162049</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="composants" className="space-y-6">
          <h2 className="text-2xl font-semibold">Composants</h2>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Alertes</h3>
            <div className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Ceci est une alerte d'information standard.
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Une erreur s'est produite lors du traitement de votre demande.
                </AlertDescription>
              </Alert>
              
              <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Succès</div>
                  <div className="text-sm">Votre opération a été effectuée avec succès.</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Avertissement</div>
                  <div className="text-sm">Veuillez vérifier les informations avant de continuer.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-teamwork-primary">Badge Primaire</Badge>
              <Badge className="bg-teamwork-primary-light">Badge Secondaire</Badge>
              <Badge variant="outline">Badge Outline</Badge>
              <Badge variant="secondary">Badge Secondaire</Badge>
              <Badge className="bg-green-600">Succès</Badge>
              <Badge className="bg-yellow-500 text-black">Avertissement</Badge>
              <Badge className="bg-red-600">Erreur</Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Formulaires</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="exemple@teamwork.fr" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="rounded border-gray-300 text-teamwork-primary-light focus:ring-teamwork-primary-light"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    J'accepte les conditions d'utilisation
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Votre message ici..."
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="select">Sélection</Label>
                  <select 
                    id="select" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="boutons" className="space-y-6">
          <h2 className="text-2xl font-semibold">Boutons</h2>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Variantes</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-teamwork-primary hover:bg-teamwork-primary/90">Primaire</Button>
              <Button className="bg-teamwork-primary-light hover:bg-teamwork-primary-light/90">Secondaire</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Lien</Button>
              <Button variant="destructive">Destructif</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Tailles</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" className="bg-teamwork-primary">Petit</Button>
              <Button className="bg-teamwork-primary">Défaut</Button>
              <Button size="lg" className="bg-teamwork-primary">Grand</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">États</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-teamwork-primary">Normal</Button>
              <Button className="bg-teamwork-primary" disabled>Désactivé</Button>
              <Button className="bg-teamwork-primary" aria-pressed="true">Actif</Button>
              <Button className="bg-teamwork-primary hover:bg-teamwork-primary/90 focus:ring-2 focus:ring-teamwork-primary-light focus:ring-offset-2">Focus</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Avec icônes</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-teamwork-primary">
                <Info className="mr-2 h-4 w-4" /> Avec icône
              </Button>
              <Button className="bg-teamwork-primary-light">
                Avec icône <X className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cartes" className="space-y-6">
          <h2 className="text-2xl font-semibold">Cartes</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-teamwork-primary">Titre de la carte</CardTitle>
                <CardDescription>Description de la carte</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contenu de la carte avec le style TeamWork.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost">Annuler</Button>
                <Button className="bg-teamwork-primary">Confirmer</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="bg-teamwork-gradient text-white">
                <CardTitle>Carte avec dégradé</CardTitle>
                <CardDescription className="text-white/80">Utilisation du dégradé TeamWork</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p>Cette carte utilise le dégradé principal de TeamWork dans son en-tête.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teamwork-primary-light rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-teamwork-primary-light">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-2 border-teamwork-primary-light">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-teamwork-primary">Carte complète</CardTitle>
                    <CardDescription>Exemple de carte avec plusieurs éléments</CardDescription>
                  </div>
                  <Badge className="bg-teamwork-primary-light">Nouveau</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Cette carte montre comment combiner différents éléments de la charte graphique TeamWork.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium text-teamwork-primary">Statistiques</div>
                      <div className="mt-2 text-2xl font-bold">1,234</div>
                      <div className="text-xs text-teamwork-neutral-3">+12% depuis le mois dernier</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium text-teamwork-primary">Utilisateurs</div>
                      <div className="mt-2 text-2xl font-bold">567</div>
                      <div className="text-xs text-teamwork-neutral-3">+5% depuis le mois dernier</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-teamwork-neutral-7 rounded-md border border-teamwork-neutral-5">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-teamwork-primary-light mt-0.5" />
                      <div>
                        <div className="font-medium">Conseil</div>
                        <div className="text-sm text-teamwork-neutral-3">Utilisez les couleurs de la charte graphique pour une meilleure cohérence visuelle.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-200 pt-4">
                <Button variant="outline">Annuler</Button>
                <div className="space-x-2">
                  <Button variant="ghost">Précédent</Button>
                  <Button className="bg-teamwork-primary">Suivant</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeamworkThemeDemo;
