import { ChangeEvent, FormEvent, useState } from 'react';
import ContextManager from './ContextManager';
import type { ContextInputType, PricingContextItem, PromptPreset } from '../types/types';
import SearchPricings from './SearchPricings';
import usePlayground from '../hooks/usePlayground';
import UseCaseSelect from './UseCaseSelect';

interface Props {
  question: string;
  detectedPricingUrls: string[];
  contextItems: PricingContextItem[];
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onPresetSelect: (preset: PromptPreset) => void;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onFileSelect: (files: FileList | null) => void;
  onContextAdd: (input: ContextInputType) => void;
  onContextRemove: (id: string) => void;
  onSphereContextRemove: (sphereId: string) => void;
  onContextClear: () => void;
}

function ControlPanel({
  question,
  detectedPricingUrls,
  contextItems,
  isSubmitting,
  isSubmitDisabled,
  onQuestionChange,
  onSubmit,
  onFileSelect,
  onContextAdd,
  onContextRemove,
  onSphereContextRemove,
  onContextClear,
  onPresetSelect
}: Props) {
  const [showPricingModal, setPricingModal] = useState<boolean>(false);
  const isPlaygroundEnabled = usePlayground();

  const handleQuestionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange(event.target.value);
  };

  const handleOpenModal = () => setPricingModal(true);
  const handleCloseModal = () => setPricingModal(false);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {isPlaygroundEnabled && <UseCaseSelect onPresetSelect={onPresetSelect} />}
      <label className="space-y-2">
        <span className="text-sm font-medium">Question</span>
        <textarea
        name="question"
        required
        disabled={isPlaygroundEnabled}
        value={question}
        onChange={handleQuestionChange}
        placeholder="Which is the best available subscription for a team of five users?"
        rows={4}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
      />
      </label>
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitDisabled} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          {isSubmitting ? 'Processing...' : 'Ask'}
        </button>
      </div>
      <ContextManager
        items={contextItems}
        detectedUrls={detectedPricingUrls}
        onAdd={onContextAdd}
        onRemove={onContextRemove}
        onClear={onContextClear}
      />

      {!isPlaygroundEnabled && (
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          Add Pricing Context
        </h2>
      )}

      {!isPlaygroundEnabled && (
        <div className="grid gap-4 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
          <section className="space-y-3 lg:pr-4">
            <label className="block">
              <span className="inline-flex w-full cursor-pointer justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Select archives
              <input
                type="file"
                accept=".yaml,.yml"
                multiple
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const files = event.target.files ?? null;
                  onFileSelect(files);
                }}
              />
              </span>
            </label>
            <h3 className="text-lg font-semibold text-slate-800">
              Upload pricing YAML (optional)
            </h3>
            <p className="text-sm text-slate-700">
              Uploaded YAMLs appear in the pricing context above so you can remove them at any time.
            </p>
          </section>

          <section className="space-y-3 lg:pl-4">
            <button type="button" onClick={handleOpenModal} className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Search pricings
            </button>
            <h3 className="text-lg font-semibold text-slate-800">
              Add SPHERE iPricing (optional)
            </h3>
            <p className="text-sm text-slate-700">
              Add iPricings with our SPHERE integration (our iPricing repository).
            </p>
            <p className="text-sm text-slate-700">
              You can further customize the search if you type a pricing name in the search bar.
            </p>

            {showPricingModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">Search Pricings</h3>
                    <button type="button" onClick={handleCloseModal} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                      Close
                    </button>
                  </div>
                <SearchPricings
                  onContextAdd={onContextAdd}
                  onContextRemove={onSphereContextRemove}
                />
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </form>
  );
}

export default ControlPanel;
