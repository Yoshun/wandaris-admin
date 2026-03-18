<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Communaute" icon="i-lucide-message-square" />
      <UDashboardToolbar>
        <UTabs :items="tabItems" v-model="tab" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <p v-if="errorMsg" class="text-error p-4">{{ errorMsg }}</p>

      <!-- Submissions -->
      <div v-if="tab === 'submissions'" class="p-4">
        <div v-if="loading" class="space-y-3">
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-20 w-full" />
        </div>

        <div v-else-if="submissions.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
          <p class="text-muted">Aucune proposition.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="s in submissions"
            :key="s.id"
            class="bg-elevated border border-default rounded-lg p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-primary font-bold">{{ s.name }}</span>
                  <UBadge :color="statusColor(s.status)" size="xs">{{ statusLabel(s.status) }}</UBadge>
                  <span class="text-dimmed text-xs">Joueur #{{ s.playerId }}</span>
                </div>
                <p v-if="s.description" class="text-muted text-sm mb-1">{{ s.description }}</p>
                <!-- Photos -->
                <div v-if="s.photos && s.photos.length > 0" class="flex gap-2 my-2">
                  <a
                    v-for="(photo, i) in s.photos"
                    :key="i"
                    :href="`${apiBase}/uploads/poi-submissions/${photo}`"
                    target="_blank"
                  >
                    <img
                      :src="`${apiBase}/uploads/poi-submissions/${photo}`"
                      class="w-24 h-24 object-cover rounded border border-default hover:opacity-80 transition"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                  </a>
                </div>
                <p class="text-dimmed text-xs">
                  {{ s.lat.toFixed(5) }}, {{ s.lon.toFixed(5) }} — {{ formatDate(s.createdAt) }}
                </p>
                <!-- Reject reason input -->
                <div v-if="rejectingId === s.id" class="mt-2 flex gap-2">
                  <UInput
                    v-model="rejectReason"
                    placeholder="Raison du refus (visible par le joueur)"
                    class="flex-1"
                    size="sm"
                  />
                  <UButton size="sm" color="error" :loading="actionLoading === s.id" @click="doRejectSubmission(s.id)">
                    Confirmer
                  </UButton>
                  <UButton size="sm" variant="outline" @click="rejectingId = null">Annuler</UButton>
                </div>
              </div>

              <div v-if="s.status === 'pending'" class="flex gap-2 shrink-0">
                <UButton size="sm" color="success" :loading="actionLoading === s.id" @click="approveSubmission(s.id)">
                  Approuver
                </UButton>
                <UButton size="sm" color="error" variant="outline" @click="startRejectSubmission(s.id)">
                  Refuser
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports -->
      <div v-if="tab === 'reports'" class="p-4">
        <div v-if="loading" class="space-y-3">
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-20 w-full" />
        </div>

        <div v-else-if="reports.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
          <p class="text-muted">Aucun signalement.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="r in reports"
            :key="r.id"
            class="bg-elevated border border-default rounded-lg p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-primary font-bold">{{ r.poiName ?? 'POI supprime' }}</span>
                  <UBadge :color="statusColor(r.status)" size="xs">{{ statusLabel(r.status) }}</UBadge>
                  <span class="text-dimmed text-xs">Joueur #{{ r.playerId }}</span>
                </div>
                <p class="text-muted text-sm mb-1">{{ r.message }}</p>
                <p class="text-dimmed text-xs">{{ formatDate(r.createdAt) }}</p>

                <!-- Admin response input -->
                <div v-if="respondingId === r.id" class="mt-2 flex gap-2">
                  <UInput
                    v-model="adminResponse"
                    placeholder="Reponse (visible par le joueur)"
                    class="flex-1"
                    size="sm"
                  />
                  <UButton size="sm" color="success" :loading="actionLoading === r.id" @click="resolveReport(r.id)">
                    Resoudre
                  </UButton>
                  <UButton size="sm" color="error" :loading="actionLoading === r.id" @click="dismissReport(r.id)">
                    Rejeter
                  </UButton>
                  <UButton size="sm" variant="outline" @click="respondingId = null">Annuler</UButton>
                </div>

                <p v-if="r.adminResponse" class="text-warning text-sm mt-1 italic">Reponse : {{ r.adminResponse }}</p>
              </div>

              <div v-if="r.status === 'pending'" class="shrink-0">
                <UButton size="sm" variant="outline" @click="startRespondReport(r.id)">
                  Repondre
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PoiReportRecord, PoiSubmissionRecord } from '~~/types/poi'
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const api = useApi()

const tab = ref<'submissions' | 'reports'>('submissions')
const loading = ref(true)
const errorMsg = ref('')
const submissions = ref<PoiSubmissionRecord[]>([])
const reports = ref<PoiReportRecord[]>([])
const actionLoading = ref<number | null>(null)

const tabItems = computed(() => [
  { label: `Propositions (${submissions.value.length})`, value: 'submissions' },
  { label: `Signalements (${reports.value.length})`, value: 'reports' },
])

// Reject submission state
const rejectingId = ref<number | null>(null)
const rejectReason = ref('')

// Report response state
const respondingId = ref<number | null>(null)
const adminResponse = ref('')

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuve',
    rejected: 'Refuse',
    resolved: 'Resolu',
    dismissed: 'Rejete',
  }
  return labels[status] ?? status
}

function statusColor(status: string): 'warning' | 'success' | 'error' | 'neutral' {
  if (status === 'pending') return 'warning'
  if (status === 'approved' || status === 'resolved') return 'success'
  if (status === 'rejected' || status === 'dismissed') return 'error'
  return 'neutral'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

async function fetchAll() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [subs, reps] = await Promise.all([
      api.listPoiSubmissions(),
      api.listPoiReports(),
    ])
    submissions.value = subs
    reports.value = reps
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

async function approveSubmission(id: number) {
  actionLoading.value = id
  try {
    await api.updatePoiSubmission(id, { status: 'approved' })
    await fetchAll()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

function startRejectSubmission(id: number) {
  rejectingId.value = id
  rejectReason.value = ''
}

async function doRejectSubmission(id: number) {
  actionLoading.value = id
  try {
    await api.updatePoiSubmission(id, { status: 'rejected', rejectReason: rejectReason.value || undefined })
    rejectingId.value = null
    await fetchAll()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

function startRespondReport(id: number) {
  respondingId.value = id
  adminResponse.value = ''
}

async function resolveReport(id: number) {
  actionLoading.value = id
  try {
    await api.updatePoiReport(id, { status: 'resolved', adminResponse: adminResponse.value || undefined })
    respondingId.value = null
    await fetchAll()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

async function dismissReport(id: number) {
  actionLoading.value = id
  try {
    await api.updatePoiReport(id, { status: 'dismissed', adminResponse: adminResponse.value || undefined })
    respondingId.value = null
    await fetchAll()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

onMounted(fetchAll)
</script>
