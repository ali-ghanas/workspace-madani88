create function fn_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger generik: dipasang ke semua tabel yang tercantum di bawah supaya
-- audit_log terisi otomatis (A5) tanpa logika manual di tiap form/server action.
create function fn_audit_log()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.audit_log (nama_tabel, data_id, aksi, nilai_lama, nilai_baru, pengguna_id)
  values (
    TG_TABLE_NAME,
    coalesce((case when TG_OP = 'DELETE' then old.id else new.id end), null),
    lower(TG_OP),
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    auth.uid()
  );
  return coalesce(new, old);
end;
$$;

do $$
declare
  t text;
  updated_at_tables text[] := array[
    'entitas', 'outlet', 'pengguna', 'penugasan', 'pegawai', 'dokumen_pegawai',
    'produk', 'satuan_produk', 'stok_parameter', 'supplier', 'pelanggan', 'persetujuan'
  ];
  -- peran_izin sengaja tidak diaudit di sini: tabel penghubung ini tidak
  -- punya kolom id (primary key-nya gabungan peran_id+izin_id), dan
  -- fn_audit_log() di atas mengasumsikan setiap tabel beraudit punya id.
  audited_tables text[] := array[
    'entitas', 'outlet', 'pengguna', 'peran', 'penugasan',
    'pegawai', 'dokumen_pegawai',
    'produk', 'satuan_produk', 'barcode_produk', 'harga_produk', 'stok_parameter',
    'supplier', 'pelanggan', 'persetujuan', 'periode'
  ];
begin
  foreach t in array updated_at_tables loop
    execute format(
      'create trigger trg_touch_updated_at before update on %I for each row execute function fn_touch_updated_at();',
      t
    );
  end loop;

  foreach t in array audited_tables loop
    execute format(
      'create trigger trg_audit_log after insert or update or delete on %I for each row execute function fn_audit_log();',
      t
    );
  end loop;
end $$;
