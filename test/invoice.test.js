const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(id, name, sku, hsn, price, qty, gstRate) {
  return { id, name, sku, hsn, price, qty, gstRate };
}

const cases = [
  {
    name: 'CURRENT BEHAVIOUR: order 1001 mixed GST slabs without coupon',
    coupon: '',
    items: [
      item(8, 'Assam CTC Masala Chai 250g', 'BEV-001', '0902', 140, 2, 18),
      item(2, 'Unpolished Toor Dal 1kg', 'GRN-002', '0713', 165, 2, 5)
    ],
    invoice: {
      subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9,
      rows: [
        { gstPercent: 18, line: 280, lineTax: 50.4 },
        { gstPercent: 5, line: 330, lineTax: 16.5 }
      ]
    },
    checkout: { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9 }
  },
  {
    name: 'INVOICE MATCHES CHECKOUT: order 1002 SAVE10 discount with 5% GST items',
    coupon: 'SAVE10',
    items: [
      item(1, 'Indrayani Basmati Rice 5kg', 'GRN-001', '1006', 640, 1, 5),
      item(4, 'Cold-Pressed Sunflower Oil 1L', 'OIL-001', '1512', 190, 2, 5)
    ],
    invoice: {
      subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
      rows: [
        { gstPercent: 5, line: 640, lineTax: 28.8 },
        { gstPercent: 5, line: 380, lineTax: 17.1 }
      ]
    },
    checkout: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 }
  },
  {
    name: 'INVOICE MATCHES CHECKOUT: order 1004 SAVE10 discount is capped at ₹150',
    coupon: 'SAVE10',
    items: [
      item(5, 'Cold-Pressed Groundnut Oil 5L', 'OIL-002', '1508', 1120, 2, 5)
    ],
    invoice: {
      subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
      rows: [{ gstPercent: 5, line: 2240, lineTax: 104.5 }]
    },
    checkout: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
  },
  {
    name: 'CURRENT BEHAVIOUR: order 1008 all 18% GST without coupon',
    coupon: '',
    items: [
      item(8, 'Assam CTC Masala Chai 250g', 'BEV-001', '0902', 140, 1, 18),
      item(12, 'Kokum Sherbet Concentrate 750ml', 'BEV-003', '2106', 180, 2, 18)
    ],
    invoice: {
      subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
      rows: [
        { gstPercent: 18, line: 140, lineTax: 25.2 },
        { gstPercent: 18, line: 360, lineTax: 64.8 }
      ]
    },
    checkout: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const order = { items: scenario.items, coupon: scenario.coupon };
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.deepStrictEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      rows: invoiceFigures.rows.map(({ gstPercent, line, lineTax }) => ({ gstPercent, line, lineTax }))
    }, scenario.invoice);

    assert.deepStrictEqual({
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      cgst: checkoutFigures.cgst,
      sgst: checkoutFigures.sgst,
      total: checkoutFigures.total
    }, scenario.checkout);
  });
}

test('INVOICE MATCHES CHECKOUT: order 1004 uses HSN GST and capped discount before tax', () => {
  const items = [
    item(5, 'Cold-Pressed Groundnut Oil 5L', 'OIL-002', '1508', 1120, 2)
  ];
  const invoiceFigures = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });
  const checkoutFigures = pricing.computeTotals(items, 'SAVE10');

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    rows: invoiceFigures.rows.map(({ gstPercent, line, lineTax }) => ({ gstPercent, line, lineTax }))
  }, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total,
    rows: [{ gstPercent: 5, line: 2240, lineTax: 104.5 }]
  });
});
