import type { EmailProcessingErrorValue } from '../email-callbacks.constants';
import type { EmailCallback } from '../email-callbacks.types';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { timeAgo } from '@/modules/shared/date/time-ago';
import { cn } from '@/modules/shared/style/cn';
import { CopyIconButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/ui/components/table';
import { useNavigate, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { createSolidTable, flexRender, getCoreRowModel, getPaginationRowModel } from '@tanstack/solid-table';
import { capitalize } from 'lodash-es';
import { type Component, createSignal, For, Show } from 'solid-js';
import { DisabledEmailBadge } from '../components/disabled-email-badge.component';
import { useDeleteEmailCallback, useUpdateEmailCallback } from '../email-callbacks.composables';
import { EMAIL_PROCESSING_STATUS } from '../email-callbacks.constants';
import { formatEmailAddress } from '../email-callbacks.models';
import { getEmailCallback, getEmailProcessings } from '../email-callbacks.services';

const ProcessingStatusBadge: Component<{ status: string }> = (props) => {
  const { t } = useI18n();

  const variant = () => ({
    [EMAIL_PROCESSING_STATUS.SUCCESS]: {
      text: t('processing.status.success'),
      variant: 'bg-green-500/10 text-green-600',
    },
    [EMAIL_PROCESSING_STATUS.ERROR]: {
      text: t('processing.status.error'),
      variant: 'bg-red-500/10 text-red-500',
    },
    [EMAIL_PROCESSING_STATUS.NOT_PROCESSED]: {
      text: t('processing.status.not-processed'),
      variant: 'bg-gray-500/10 text-gray-500',
    },
  })[props.status];

  return (
    <span class={cn('px-2 py-1 rounded-md text-xs font-medium', variant()?.variant)}>
      {variant()?.text}
    </span>
  );
};

const ProcessingError: Component<{ error?: string | null }> = (props) => {
  const { t } = useI18n();

  if (!props.error) {
    return null;
  }

  return (
    <span class="text-muted-foreground">{t(`processing.error.${props.error as EmailProcessingErrorValue}`) ?? t('processing.error.unknown')}</span>
  );
};

const ProcessingList: Component<{ emailCallback: EmailCallback }> = (props) => {
  const { t, te } = useI18n();

  const [getPagination, setPagination] = createSignal({
    pageIndex: 0,
    pageSize: 15,
  });

  const query = createQuery(() => ({
    queryKey: ['email-callbacks', props.emailCallback.id, 'processings', getPagination()],
    queryFn: () => getEmailProcessings({ emailCallbackId: props.emailCallback.id, ...getPagination() }),
  }));

  const table = createSolidTable({
    get data() {
      return query.data?.emailProcessings ?? [];
    },
    columns: [

      {
        header: 'From',
        accessorKey: 'fromAddress',
      },
      {
        header: 'Subject',
        accessorKey: 'subject',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: data => <ProcessingStatusBadge status={data.getValue<string>()} />,
      },
      {
        header: 'Details',
        accessorKey: 'error',
        cell: data => data.getValue<string>() && <ProcessingError error={data.getValue<string>()} />,
      },
      {
        header: 'Webhook status code',
        accessorKey: 'webhookResponseStatusCode',
        cell: data => data.getValue<number>() && <span class="text-muted-foreground border rounded-md px-2 py-1 text-xs">{data.getValue<number>()}</span>,
      },
      {
        header: () => (<span class="block text-right">Received at</span>),
        accessorKey: 'createdAt',
        cell: data => <div class="text-muted-foreground text-right" title={data.getValue<Date>().toLocaleString()}>{capitalize(timeAgo({ date: data.getValue<Date>() }))}</div>,
      },
    ],
    get rowCount() {
      return query.data?.emailProcessingsCount;
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      get pagination() {
        return getPagination();
      },
    },
    manualPagination: true,
  });
  return (
    <div>
      <Show when={query.data?.emailProcessings}>
        {getEmailProcessings => (
          <Show
            when={getEmailProcessings().length > 0}
            fallback={(
              <div class="px-6 py-16 w-full flex flex-col items-center justify-center text-muted-foreground">
                <div class="i-tabler-mail-x size-10"></div>
                <div class="text-center mt-2">{t('processing.empty.title')}</div>
                <div class="text-center mb-4">{te('processing.empty.description', { emailAddress: <span class="font-bold">{formatEmailAddress(props.emailCallback)}</span> })}</div>
              </div>
            )}
          >
            <div>

              <Table>

                <TableHeader>
                  <For each={table.getHeaderGroups()}>
                    {headerGroup => (
                      <TableRow>
                        <For each={headerGroup.headers}>
                          {(header) => {
                            return (
                              <TableHead>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                            );
                          }}
                        </For>
                      </TableRow>
                    )}
                  </For>
                </TableHeader>

                <TableBody>
                  <Show when={table.getRowModel().rows?.length}>
                    <For each={table.getRowModel().rows}>
                      {row => (
                        <TableRow>
                          <For each={row.getVisibleCells()}>
                            {cell => (
                              <TableCell>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            )}
                          </For>
                        </TableRow>
                      )}
                    </For>
                  </Show>
                </TableBody>

              </Table>

              <Show when={query.data?.emailProcessingsCount && query.data?.emailProcessingsCount > table.getState().pagination.pageSize}>
                <div class="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-end mt-4">
                  <div class="flex items-center space-x-2">
                    <p class="whitespace-nowrap text-sm font-medium">{t('tables.rows-per-page')}</p>
                    <Select
                      value={table.getState().pagination.pageSize}
                      onChange={value => value && table.setPageSize(value)}
                      options={[15, 50, 100]}
                      itemComponent={props => (
                        <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
                      )}
                    >
                      <SelectTrigger class="h-8 w-[4.5rem]">
                        <SelectValue<string>>
                          {state => state.selectedOption()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                  </div>
                  <div class="flex items-center justify-center whitespace-nowrap text-sm font-medium">
                    {t('tables.page-description', {
                      page: table.getState().pagination.pageIndex + 1,
                      total: table.getPageCount(),
                    })}
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button
                      aria-label="Go to first page"
                      variant="outline"
                      class="flex size-8 p-0"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <div class="size-4 i-tabler-chevrons-left" />
                    </Button>
                    <Button
                      aria-label="Go to previous page"
                      variant="outline"
                      size="icon"
                      class="size-8"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <div class="size-4 i-tabler-chevron-left" />
                    </Button>
                    <Button
                      aria-label="Go to next page"
                      variant="outline"
                      size="icon"
                      class="size-8"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <div class="size-4 i-tabler-chevron-right" />
                    </Button>
                    <Button
                      aria-label="Go to last page"
                      variant="outline"
                      size="icon"
                      class="flex size-8"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <div class="size-4 i-tabler-chevrons-right" />
                    </Button>
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        )}
      </Show>
    </div>
  );
};

export const EmailCallbackPage: Component = () => {
  const { t } = useI18n();
  const params = useParams();
  const navigate = useNavigate();

  const { deleteEmailCallback } = useDeleteEmailCallback();
  const { enableEmailCallback, disableEmailCallback } = useUpdateEmailCallback();

  const query = createQuery(() => ({
    queryKey: ['email-callbacks', params.emailCallbackId],
    queryFn: () => getEmailCallback({ emailCallbackId: params.emailCallbackId }),
  }));

  async function handleDeleteEmailCallback({ emailCallbackId }: { emailCallbackId: string }) {
    await deleteEmailCallback({ emailCallbackId });
    navigate('/');
  }

  return (
    <div class="max-w-1200px w-full mx-auto px-6 pt-2">
      <Show when={query.data?.emailCallback}>
        {getEmailCallback => (
          <div>
            <div class="border-b py-4 mb-8">
              <div class="mb-6">
                <Button variant="outline" size="sm" class="gap-2" onClick={() => navigate('/')}>
                  <div class="i-tabler-chevron-left size-4" />
                  {t('email-callbacks.back-to-emails')}
                </Button>
              </div>

              <div class=" flex flex-row gap-3 sm:items-center justify-between flex-col sm:flex-row">
                <div class="flex flex-row gap-3 items-center">
                  <div class="bg-card border rounded-lg p-2.5 hidden sm:block">
                    <div class={cn('i-tabler-mail size-7')} />
                  </div>

                  <div>
                    <div class="text-base font-medium flex flex-row gap-2 items-center">
                      {formatEmailAddress(getEmailCallback())}
                      <CopyIconButton
                        text={formatEmailAddress(getEmailCallback())}
                        class="text-muted-foreground size-5 text-base"
                        toast={t('email-callbacks.copy-email-address.copied')}
                        tooltip={t('email-callbacks.copy-email-address.label')}
                      />

                      <Show when={!getEmailCallback().isEnabled}>
                        <DisabledEmailBadge />
                      </Show>

                    </div>

                    <div class="text-muted-foreground">
                      {getEmailCallback().webhookUrl}
                    </div>
                  </div>
                </div>

                <div class="flex flex-row gap-2">
                  <Button
                    class="gap-2"
                    variant="outline"
                    onClick={() => getEmailCallback().isEnabled
                      ? disableEmailCallback({ emailCallbackId: getEmailCallback().id })
                      : enableEmailCallback({ emailCallbackId: getEmailCallback().id })}
                  >
                    <div class="i-tabler-power size-4" />
                    {getEmailCallback().isEnabled ? t('email-callbacks.disable') : t('email-callbacks.enable')}
                  </Button>

                  <Button class="gap-2 text-red-500" variant="outline" onClick={() => handleDeleteEmailCallback({ emailCallbackId: getEmailCallback().id })}>
                    <div class="i-tabler-trash size-4" />
                    {t('email-callbacks.delete')}
                  </Button>
                </div>
              </div>
            </div>

            <ProcessingList emailCallback={getEmailCallback()} />

          </div>
        )}
      </Show>
    </div>
  );
};
