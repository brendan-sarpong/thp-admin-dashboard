import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  createHumorFlavorStepAction,
  deleteHumorFlavorStepAction,
  moveHumorFlavorStepAction,
  updateHumorFlavorAction,
  updateHumorFlavorStepAction,
} from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function MatrixFlavorDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();

  const { data: flavor, error: fe } = await supabase
    .from("humor_flavors")
    .select("id, name, description")
    .eq("id", id)
    .maybeSingle();

  if (fe || !flavor) {
    notFound();
  }

  const { data: steps, error: se } = await supabase
    .from("humor_flavor_steps")
    .select("id, step_order, prompt")
    .eq("humor_flavor_id", id)
    .order("step_order", { ascending: true });

  const nextOrder =
    (steps?.length ? Math.max(...steps.map((s) => Number(s.step_order) || 0)) : 0) + 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Flavor</p>
          <h1 className="text-2xl font-semibold">{flavor.name}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {flavor.description ?? "No description"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/matrix/flavors/${id}/test`} className="underline">
            Test with image
          </Link>
          <Link href={`/matrix/flavors/${id}/captions`} className="underline">
            Captions
          </Link>
          <Link href="/matrix/flavors" className="underline">
            All flavors
          </Link>
        </div>
      </div>

      {sp.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {sp.error}
        </p>
      )}

      <section className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-medium">Edit flavor</h2>
        <form action={updateHumorFlavorAction} className="space-y-3">
          <input type="hidden" name="id" value={flavor.id} />
          <label className="flex flex-col gap-1 text-sm">
            <span>Name</span>
            <input
              name="name"
              defaultValue={flavor.name}
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Description</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={flavor.description ?? ""}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save flavor
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Steps</h2>
          {se && (
            <span className="text-xs text-red-600 dark:text-red-400">{se.message}</span>
          )}
        </div>

        <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 text-sm font-medium">Add step</h3>
          <form action={createHumorFlavorStepAction} className="grid gap-2 sm:grid-cols-3">
            <input type="hidden" name="humor_flavor_id" value={id} />
            <label className="flex flex-col gap-1 text-xs">
              <span>Order</span>
              <input
                name="step_order"
                type="number"
                defaultValue={nextOrder}
                required
                className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span>Prompt</span>
              <textarea
                name="prompt"
                rows={2}
                required
                className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900 sm:col-span-3"
            >
              Add step
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {(steps ?? []).map((step, index) => (
            <div
              key={step.id}
              className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-zinc-500">
                  Step {index + 1} · order {String(step.step_order)}
                </span>
                <div className="flex flex-wrap gap-2">
                  <form action={moveHumorFlavorStepAction}>
                    <input type="hidden" name="humor_flavor_id" value={id} />
                    <input type="hidden" name="step_id" value={step.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-600"
                    >
                      Up
                    </button>
                  </form>
                  <form action={moveHumorFlavorStepAction}>
                    <input type="hidden" name="humor_flavor_id" value={id} />
                    <input type="hidden" name="step_id" value={step.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-600"
                    >
                      Down
                    </button>
                  </form>
                  <form action={deleteHumorFlavorStepAction}>
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="humor_flavor_id" value={id} />
                    <button
                      type="submit"
                      className="text-xs text-red-700 underline dark:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <form action={updateHumorFlavorStepAction} className="space-y-2">
                <input type="hidden" name="id" value={step.id} />
                <input type="hidden" name="humor_flavor_id" value={id} />
                <label className="flex flex-col gap-1 text-xs">
                  <span>Order</span>
                  <input
                    name="step_order"
                    type="number"
                    defaultValue={step.step_order}
                    required
                    className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span>Prompt</span>
                  <textarea
                    name="prompt"
                    rows={3}
                    defaultValue={step.prompt}
                    required
                    className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
                >
                  Save step
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
