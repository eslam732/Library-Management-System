/**
 * Export Utility
 * Provides helper functions to export data as CSV or XLSX format.
 */

const XLSX = require('xlsx');

/**
 * Sends data as a CSV file response.
 * @param {import('express').Response} res - Express response object
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Desired filename without extension
 */
function exportCSV(res, data, filename) {
    if (!data || data.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send('No data available');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csv);
}

/**
 * Sends data as an XLSX file response.
 * @param {import('express').Response} res - Express response object
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Desired filename without extension
 */
function exportXLSX(res, data, filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data.length ? data : [{}]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.send(buffer);
}

module.exports = { exportCSV, exportXLSX };
