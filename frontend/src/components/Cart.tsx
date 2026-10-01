import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getCartUnitPrice } from '../utils/cartPricing';

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export default function Cart() {
  const { items, subtotal, discount, shipping, grandTotal, updateQuantity, removeItem } = useCart();
  const { darkMode } = useTheme();
  const panelClass = darkMode
    ? 'border-white/10 bg-[#1e261f] text-light'
    : 'border-gray-200 bg-white text-gray-800';
  const mutedTextClass = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div
      className={`min-h-screen px-4 pb-16 pt-24 transition-colors duration-300 ${
        darkMode ? 'bg-[#111811]' : 'bg-gray-100'
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <h1 className={`mb-6 text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <section className={`rounded-xl border p-10 text-center shadow-sm ${panelClass}`}>
            <p className="text-xl font-semibold">Your cart is empty</p>
            <p className={`mt-2 ${mutedTextClass}`}>Add something your cat will love.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-accent"
            >
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
            <section className={`overflow-hidden rounded-xl border shadow-sm ${panelClass}`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-center">
                  <thead className={darkMode ? 'bg-[#171e19]' : 'bg-gray-50'}>
                    <tr className="text-sm font-semibold sm:text-base">
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        S. No.
                      </th>
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        Product Image
                      </th>
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        Product Name
                      </th>
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        Unit Price
                      </th>
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        Quantity
                      </th>
                      <th scope="col" className="border-b border-r border-white/10 px-3 py-4">
                        Total
                      </th>
                      <th scope="col" className="border-b border-white/10 px-3 py-4">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ product, quantity }, index) => {
                      const unitPrice = getCartUnitPrice(product);
                      return (
                        <tr key={product.productId} data-testid={`cart-row-${product.productId}`}>
                          <td className="border-b border-r border-white/10 px-3 py-4 font-semibold">
                            {index + 1}
                          </td>
                          <td className="border-b border-r border-white/10 px-3 py-2">
                            <img
                              src={`/${product.imgName}`}
                              alt={product.name}
                              className="mx-auto h-20 w-24 object-contain"
                            />
                          </td>
                          <th
                            scope="row"
                            className="border-b border-r border-white/10 px-3 py-4 font-semibold"
                          >
                            {product.name}
                          </th>
                          <td className="border-b border-r border-white/10 px-3 py-4 font-semibold">
                            {formatCurrency(unitPrice)}
                          </td>
                          <td className="border-b border-r border-white/10 px-3 py-4">
                            <input
                              aria-label={`Quantity of ${product.name}`}
                              type="number"
                              min="1"
                              step="1"
                              value={quantity}
                              onChange={(event) => {
                                const nextQuantity = Number.parseInt(event.currentTarget.value, 10);
                                if (Number.isInteger(nextQuantity) && nextQuantity > 0) {
                                  updateQuantity(product.productId, nextQuantity);
                                }
                              }}
                              className={`w-16 rounded-lg border px-2 py-2 text-center font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                darkMode
                                  ? 'border-gray-600 bg-[#1b2220] text-light'
                                  : 'border-gray-300 bg-white text-gray-800'
                              }`}
                            />
                          </td>
                          <td className="border-b border-r border-white/10 px-3 py-4 font-semibold">
                            {formatCurrency(unitPrice * quantity)}
                          </td>
                          <td className="border-b border-white/10 px-3 py-4">
                            <button
                              type="button"
                              aria-label={`Remove ${product.name} from cart`}
                              onClick={() => removeItem(product.productId)}
                              className="rounded p-2 text-lime-500 transition-colors hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="p-3 text-left">
                        <div className="flex max-w-xl">
                          <input
                            type="text"
                            aria-label="Coupon code"
                            placeholder="Coupon Code"
                            disabled
                            className={`min-w-0 flex-1 rounded-l-full border px-5 py-3 text-sm disabled:cursor-not-allowed ${
                              darkMode
                                ? 'border-white/10 bg-[#252d2d] text-gray-400 placeholder:text-gray-500'
                                : 'border-gray-300 bg-gray-100 text-gray-500 placeholder:text-gray-400'
                            }`}
                          />
                          <button
                            type="button"
                            disabled
                            title="Coupon codes are not available yet"
                            className="rounded-r-full bg-primary px-5 py-3 text-sm font-semibold text-white opacity-70"
                          >
                            Apply Coupon
                          </button>
                        </div>
                      </td>
                      <td colSpan={3} className="p-3 text-right">
                        <Link
                          to="/products"
                          className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
                        >
                          Continue Shopping
                        </Link>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <aside className={`overflow-hidden rounded-xl border shadow-sm ${panelClass}`}>
              <h2 className="border-b border-white/10 px-5 py-4 text-center text-2xl font-bold">
                Order Summary
              </h2>
              <dl className="divide-y divide-white/10">
                <div className="flex items-center justify-between px-5 py-3">
                  <dt className="font-semibold">Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <dt className="font-semibold">Discount (5%)</dt>
                  <dd>-{formatCurrency(discount)}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <dt className="font-semibold">Shipping</dt>
                  <dd>{formatCurrency(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3 text-lg font-bold">
                  <dt>Grand Total</dt>
                  <dd>{formatCurrency(grandTotal)}</dd>
                </div>
              </dl>
              <div className="p-5">
                <button
                  type="button"
                  disabled
                  title="Checkout is not available yet"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-lime-500 px-5 py-3 font-semibold text-white opacity-70"
                >
                  Proceed To Checkout
                </button>
                <p className={`mt-2 text-center text-xs ${mutedTextClass}`}>
                  Checkout is not available yet.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
