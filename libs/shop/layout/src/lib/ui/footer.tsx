import {
  APP_COLUMN_HEADING,
  APP_QR_SRC,
  FOOTER_COLUMNS,
  FRAUD_NOTICE,
} from '../model/layout-content';

export function Footer() {
  return (
    <footer className="bg-footer text-on-action">
      <div className="mx-auto w-full max-w-shop px-4 pt-12.5 pb-10">
        <p className="rounded-card border-3 border-footer-accent-line p-3.5 text-ec-base font-bold text-footer-accent">
          {FRAUD_NOTICE}
        </p>

        <div className="mt-5 grid grid-cols-6 gap-4">
          {FOOTER_COLUMNS.map((column) => (
            <section key={column.heading} aria-label={column.heading}>
              <Heading>{column.heading}</Heading>
              <ul>
                {column.items.map((item) => (
                  <li key={item} className="text-ec-sm leading-6">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-label={APP_COLUMN_HEADING}>
            <Heading>{APP_COLUMN_HEADING}</Heading>
            <img
              src={APP_QR_SRC}
              alt="momo 行動購物 APP 下載 QR code"
              className="size-25 bg-surface"
            />
          </section>
        </div>
      </div>
    </footer>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mb-2.5 text-ec-xl font-bold text-footer-accent">
      {children}
    </h2>
  );
}
