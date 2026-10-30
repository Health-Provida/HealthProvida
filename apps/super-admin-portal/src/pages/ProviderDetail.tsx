import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Check, EyeOff, Star, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { providers } from "@/lib/mock-data";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export default function ProviderDetail() {
  const { providerId } = useParams<{ providerId: string }>();
  const provider = providers.find((p) => p.id === providerId);

  if (!provider) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">This facility no longer exists in the directory.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/providers">Back to hospitals & clinics</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/providers">
          <ArrowLeft className="mr-2 h-4 w-4" /> All facilities
        </Link>
      </Button>

      <PageHeader
        title={provider.name}
        description={`${provider.type} · ${provider.address}`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast.success(`${provider.name} hidden from public search`)}
            >
              <EyeOff className="mr-2 h-4 w-4" /> Hide listing
            </Button>
            <Button onClick={() => toast.success(`${provider.name} marked as verified`)}>
              <Check className="mr-2 h-4 w-4" /> Approve provider
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge status={provider.status} />
        <StatusBadge status={provider.verification} />
        <StatusBadge status={provider.visibility} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Tabs defaultValue="profile">
              <div className="border-b border-border px-4 pt-4">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="photos">Photographs</TabsTrigger>
                  <TabsTrigger value="hmos">HMO matching</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="m-0 space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Facility ID" value={provider.id} />
                  <Field label="Region" value={`${provider.region} · ${provider.state}`} />
                  <Field label="Phone" value={provider.phone} />
                  <Field label="Email" value={provider.email} />
                  <Field label="Date added" value={provider.dateAdded} />
                  <Field label="Submitted for verification" value={provider.submittedAt} />
                </div>
                <Separator />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Specialties</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {provider.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {provider.adminComments ? (
                  <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    {provider.adminComments}
                  </p>
                ) : null}
                {provider.rejectionReason ? (
                  <p className="rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
                    {provider.rejectionReason}
                  </p>
                ) : null}
              </TabsContent>

              <TabsContent value="photos" className="m-0 space-y-3 p-4">
                {provider.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{photo.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {photo.category} · uploaded {photo.uploadedAt}
                        {photo.note ? ` · ${photo.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={photo.status} />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Approve ${photo.label}`}
                        onClick={() => toast.success(`${photo.label} approved`)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Reject ${photo.label}`}
                        onClick={() => toast.error(`${photo.label} rejected — retake requested`)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="hmos" className="m-0 space-y-3 p-4">
                {provider.hmoMatches.map((m) => (
                  <div
                    key={m.hmoId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{m.hmoName}</p>
                      <p className="text-xs text-muted-foreground">{m.plans.join(" · ")}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="m-0 space-y-3 p-4">
                {provider.reviews.map((r) => (
                  <div key={r.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{r.patientRef}</p>
                      <span className="flex items-center gap-1 text-sm tabular-nums">
                        <Star className="h-3.5 w-3.5 text-warning" /> {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{r.date}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Popularity signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Popularity score" value={provider.popularityScore} />
              <Field label="Active bookings" value={provider.activeBookings.toLocaleString()} />
              <Field
                label="Completed encounters"
                value={provider.completedEncounters.toLocaleString()}
              />
              <Field
                label="Rating"
                value={`${provider.averageRating.toFixed(1)} from ${provider.reviewCount} reviews`}
              />
              <p className="text-[11px] text-muted-foreground">
                Score = (bookings × 0.4) + (encounters × 0.3) + (rating × 0.3)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quality audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Audit score" value={`${provider.auditScore} / 100`} />
              <Field label="Last audited" value={provider.lastAuditedAt} />
              <Field label="HMO networks" value={provider.hmoNetworks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
