"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

interface Props {
  analysis: WebAnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

export default function SocialGeoCard({ analysis }: Props) {
  const og = analysis.openGraph;
  const geo = analysis.geo;

  return (
    <div className="space-y-6">
      {/* Open Graph Preview */}
      {og && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Open Graph & Social</CardTitle>
                <CardDescription>Nahled pri sdileni na socialnich sitich</CardDescription>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(og.socialScore)}`}>
                {og.socialScore}/100
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Facebook Share Preview */}
              <div>
                <p className="text-sm font-medium mb-2">Facebook share nahled:</p>
                <div className="border rounded-lg overflow-hidden max-w-md bg-white">
                  {og.ogImage && (
                    <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                      <img
                        src={og.ogImage}
                        alt="OG preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase">{og.ogSiteName || new URL(analysis.url).hostname}</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{og.ogTitle || "Chybi og:title"}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{og.ogDescription || "Chybi og:description"}</p>
                  </div>
                </div>
              </div>

              {/* OG Tags Status Table */}
              <div>
                <p className="text-sm font-medium mb-2">OG tagy:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "og:title", value: og.ogTitle },
                    { label: "og:description", value: og.ogDescription },
                    { label: "og:image", value: og.ogImage },
                    { label: "og:type", value: og.ogType },
                    { label: "og:url", value: og.ogUrl },
                    { label: "og:site_name", value: og.ogSiteName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 text-sm py-1">
                      {value ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Twitter Card */}
              <div>
                <p className="text-sm font-medium mb-2">Twitter Card:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "twitter:card", value: og.twitterCard },
                    { label: "twitter:title", value: og.twitterTitle },
                    { label: "twitter:description", value: og.twitterDescription },
                    { label: "twitter:image", value: og.twitterImage },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 text-sm py-1">
                      {value ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-sm font-medium mb-2">Odkazy na socialni site:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(og.socialLinks).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-2 text-sm py-1">
                      {url ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GEO/AIEO Analysis */}
      {geo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>GEO / AIEO Analyza</CardTitle>
                <CardDescription>Priprava pro AI vyhledavace a lokalni SEO</CardDescription>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(geo.geoScore)}`}>
                {geo.geoScore}/100
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Schema & Structured Data */}
              <div>
                <p className="text-sm font-medium mb-2">Strukturovana data (Schema.org):</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasLocalBusinessSchema ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>LocalBusiness</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasOrganizationSchema ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>Organization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasProductSchema ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>Product</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasBreadcrumbSchema ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>BreadcrumbList</span>
                  </div>
                </div>
                {geo.schemaTypes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {geo.schemaTypes.map((type, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQ & Content */}
              <div>
                <p className="text-sm font-medium mb-2">Obsah pro AI:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasFaqSection ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>FAQ sekce</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasQaFormat ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>Q&A format</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasAboutPage ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>O nas stranka</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm py-1">
                    {geo.hasContactPage ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span>Kontakt stranka</span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <p className="text-sm font-medium mb-2">Firemni informace:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Adresa", ok: geo.businessInfo.hasAddress },
                    { label: "Telefon", ok: geo.businessInfo.hasPhone },
                    { label: "Email", ok: geo.businessInfo.hasEmail },
                    { label: "Oteviraci doba", ok: geo.businessInfo.hasOpeningHours },
                    { label: "Cenik/Ceny", ok: geo.businessInfo.hasPricing },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-sm py-1">
                      {ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Freshness */}
              <div>
                <p className="text-sm font-medium mb-2">Aktualizace obsahu:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Copyright rok</span>
                    <span className="font-medium">{geo.contentFreshness.copyrightYear || "Nenalezeno"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">datePublished</span>
                    <span>{geo.contentFreshness.hasDatePublished ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-red-500 inline" />}</span>
                  </div>
                  {geo.contentFreshness.latestDateFound && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posledni datum</span>
                      <span className="font-medium">{geo.contentFreshness.latestDateFound}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
