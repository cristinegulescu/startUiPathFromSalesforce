Sub MyVBA()

Set PSheet = Worksheets("Rez2")
Set DSheet = Worksheets("Test")

'Define Data Range
LastRow = DSheet.Cells(Rows.Count, 1).End(xlUp).Row
LastCol = DSheet.Cells(1, Columns.Count).End(xlToLeft).Column
Set PRange = DSheet.Cells(1, 1).Resize(LastRow, LastCol)


'Define Pivot Cache
Set PCache = ActiveWorkbook.PivotCaches.Create _
(SourceType:=xlDatabase, SourceData:=PRange)


'Insert Blank Pivot Table
Set PTable = PCache.CreatePivotTable _
(TableDestination:=PSheet.Cells(1, 1), TableName:="RezPivot")
PTable.ClearTable

''''''' Add Fields'''''''
Set pt = PSheet.PivotTables("RezPivot")
With pt

.PivotFields("Make").Orientation = xlRowField
.PivotFields("Model").Orientation = xlRowField
.PivotFields("Color").Orientation = xlColumnField
.PivotFields("Km").Orientation = xlPageField
.PivotFields("Price").Orientation = xlDataField

End With

End Sub