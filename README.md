# club-attendance-backend

## Google Sheets API Wrapper Functions

### `sheetData(sheets, spreadsheetId, range)`
- Description: Retrieves the data from a specified range in a Google Sheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to retrieve data from.
- Returns: A promise that resolves to the sheet data as a 2D array.

### `addItemToRow(sheets, spreadsheetId, range, itemRowNumber, addItem)`
- Description: Adds an item to a specific row in a Google Sheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to update.
  - `itemRowNumber` (number): The row number to add the item to.
  - `addItem` (any): The item to add to the row.
- Returns: A promise that resolves when the item is successfully added to the row.

### `ifValueExistBinary(sheets, spreadsheetId, range, valueComparing)`
- Description: Checks if a value exists in a sorted range of cells using binary search.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to search for the value.
  - `valueComparing` (any): The value to compare against in the range.
- Returns: A promise that resolves to `true` if the value exists, or `false` otherwise.

### `addData(sheets, spreadsheetId, range, value)`
- Description: Adds data to a Google Sheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to update.
  - `value` (array): The data to add to the sheet.
- Returns: A promise that resolves when the data is successfully added to the sheet.

### `getOneData(sheets, spreadsheetId, range, valueComparing, column)`
- Description: Retrieves a specific row of data from a Google Sheet based on a matching value in a specific column.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to retrieve data from.
  - `valueComparing` (any): The value to compare against in the specified column.
  - `column` (number): The column number to search for the value.
- Returns: A promise that resolves to the matching row of data, or `undefined` if no match is found.

### `getSheetNames(sheets, spreadsheetId)`
- Description: Retrieves the names of all sheets in a Google Spreadsheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
- Returns: A promise that resolves to an array of sheet names.

### `createNewSheetWithName(sheets, spreadsheetId, sheetName)`
- Description: Creates a new sheet with the specified name in a Google Spreadsheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  -

 `spreadsheetId` (string): The ID of the spreadsheet.
  - `sheetName` (string): The name of the new sheet to create.
- Returns: A promise that resolves when the new sheet is successfully created.

### `createNewSpreadSheet(sheets, title)`
- Description: Creates a new Google Spreadsheet with the specified title.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `title` (string): The title of the new spreadsheet.
- Returns: A promise that resolves to the ID of the newly created spreadsheet.

### `generateRandomNumber(length)`
- Description: Generates a random number of the specified length.
- Parameters:
  - `length` (number): The length of the random number to generate.
- Returns: A string representing the generated random number.

### `generateRandomString(length)`
- Description: Generates a random string of the specified length.
- Parameters:
  - `length` (number): The length of the random string to generate.
- Returns: A string representing the generated random string.

### `updateKnownRowAndColumn(sheets, spreadsheetId, range, columnAlphabet, rowNumber, inputValue)`
- Description: Updates a specific cell in a Google Sheet with a new value.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to update.
  - `columnAlphabet` (string): The alphabet letter representing the column of the cell to update.
  - `rowNumber` (number): The row number of the cell to update.
  - `inputValue` (any): The new value to set in the cell.
- Returns: A promise that resolves when the cell is successfully updated.

### `appendNewItemBatch(sheets, spreadsheetId, payloadObject)`
- Description: Appends multiple new items to a Google Sheet in batch mode.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `payloadObject` (array): An array of objects representing the data to append.
- Returns: A promise that resolves when the items are successfully appended.

### `appendNewItemToColumn(sheets, spreadsheetId, range, inputValue)`
- Description: Appends a new item to a column in a Google Sheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to update.
  - `inputValue` (array): The new item to append to the column.
- Returns: A promise that resolves when the item is successfully appended to the column.

### `appendNewItemToRow(sheets, spreadsheetId, range, inputValue)`
- Description: Appends a new item to a row in a Google Sheet.
- Parameters:
  - `sheets` (object): The Google Sheets API object.
  - `spreadsheetId` (string): The ID of the spreadsheet.
  - `range` (string): The range of cells to update.
  - `inputValue` (array): The new item to append to the row.
- Returns: A promise that resolves when the item is successfully appended to the row.

## Google Drive API Wrapper Functions

### `uploadToFolder(drive, parentFolderId, folderName)`
- Description: Uploads a new folder to a specified parent folder in Google Drive.
- Parameters:
  - `drive` (object): The Google Drive API object.
  - `parentFolderId`

 (string): The ID of the parent folder in which to upload the new folder.
  - `folderName` (string): The name of the new folder.
- Returns: A promise that resolves to the ID of the newly created folder.

### `createSheetInFolder(drive, childFolderId, spreadsheetName)`
- Description: Creates a new Google Spreadsheet in a specified folder in Google Drive.
- Parameters:
  - `drive` (object): The Google Drive API object.
  - `childFolderId` (string): The ID of the folder in which to create the new spreadsheet.
  - `spreadsheetName` (string): The name of the new spreadsheet.
- Returns: A promise that resolves to the ID of the newly created spreadsheet.

