function windowSelection() {
			var razonSocialFieldS = new Ext.form.ComboBox({
				triggerAction: 'all',
				id: 'cmbRazonSocialS',
				name: 'cmbRazonSocialS',
				store: razonSocialStore,
				editable: false,
				fieldLabel: bundle.getMsg('label.company'),
				valueField: 'bukrs',
				displayField: 'butxt',
				hiddenName: 'hdnbukrs',
				mode: 'local',
				allowBlank: false,
				width: 250,
				listeners: {
					select: function(c, rec, index) {
						divisionStore.load({
							params: {
								bukrs: rec.data.bukrs
							}
						});
						divisionS.enable();
						divisionS.clearValue();
						var soc = rec.data.bukrs;
						if (soc === "1173") {
							currencyStore.removeAll();
							var data1173 = '{"data": [{"ltext":"MXN","waers":"MXN"},{"ltext":"USD","waers":"USD"},{"ltext":"EUR","waers":"EUR"}]}';
							data1173 = Ext.decode(data1173)
							currencyStore.loadData(data1173);
							monedaCmb.enable();
							monedaCmb.clearValue();
						}
						else {
							currencyStore.removeAll();
							currencyStore.load({
								params: {
									bukrs: rec.data.bukrs
								}
							});
							monedaCmb.enable();
							monedaCmb.clearValue();
						}
					}
				}
			});

			var divisionS = new Ext.form.ComboBox({
				triggerAction: 'all',
				id: 'cmbDivisionS',
				name: 'cmbDivisionS',
				store: divisionStore,
				disabled: true,
				fieldLabel: bundle.getMsg('label.division'),
				valueField: 'name',
				displayField: 'segment',
				mode: 'local',
				allowBlank: true,
				width: 250
			});

			var fechaIniS = new Ext.form.DateField({
				fieldLabel: bundle.getMsg('label.invoicepurchasedate'),
				id: 'fechaIniS',
				name: 'fechaIniS',
				allowBlank: false,
				width: 130
			});

			var fechaFinS = new Ext.form.DateField({
				fieldLabel: bundle.getMsg('label.invoicedateto'),
				id: 'fechaFinS',
				name: 'fechaFinS',
				allowBlank: false,
				width: 130
			});
			var firstDate = new Date();
			//firstDate = new Date(firstDate.getFullYear(),firstDate.getMonth(),1);
			firstDate.setFullYear(firstDate.getFullYear(), 0, 1);
			fechaIniS.setValue(firstDate);
			fechaFinS.setValue(new Date());

			var orderField = new Ext.form.TextField({
				id: 'ebeln',
				name: 'ebeln',
				fieldLabel: bundle.getMsg('label.purchaseorder'),
				allowBlank: true,
				width: 250
			});

			var receptionTypeField = new Ext.form.ComboBox({
				triggerAction: 'all',
				id: 'cmbReceptionTypeField',
				name: 'receptionType',
				store: new Ext.data.SimpleStore({
					fields: ['val', 'desc'],
					data: [
						[1, bundle.getMsg('label.receipttypeone')],
						[2, bundle.getMsg('label.receipttypetwo')]
						, [3, bundle.getMsg('label.receipttypethree')]
					]
				}),
				fieldLabel: bundle.getMsg('label.receipttype'),
				valueField: 'val',
				listWidth: 350,
				displayField: 'desc',
				typeAhead: true,
				mode: 'local',
				forceSelection: true,
				allowBlank: false,
				selectOnFocus: true,
				width: 250,
			});

			var monedaCmb = new Ext.form.ComboBox({
				id: 'monedaCmb',
				name: 'monedaCmb',
				store: currencyStore,
				fieldLabel: bundle.getMsg('label.currency'),
				typeAhead: true,
				triggerAction: 'all',
				mode: 'local',
				forceSelection: true,
				allowBlank: false,
				selectOnFocus: true,
				hiddenName: 'hdnMoneda',
				valueField: 'waers',
				displayField: 'waers',
				width: 200
			});

			var btnAgregarDoc = new Ext.Button({
				text: 'Agregar',
				handler: function() {
					var records = new Array();
					var gridData = Ext.getCmp('gridFactura');
					gridData.getStore().removeAll();
					listaFacturaStoreD.removeAll();
					listaFacturaStore.each(function(record) {
						if (record.data.select) {
							records.push(record);
						}
					});
					listaFacturaStoreD.add(records);
					var lastOptions = listaFacturaStore.lastOptions;
					var soc = Ext.getCmp('cmbRazonSocial');
					var buk = Ext.getCmp('cmbDivision');
					if (lastOptions.params) {
						soc.setValue(lastOptions.params.bukrs);
						var index = soc.getStore().find('bukrs', lastOptions.params.bukrs);
						soc.fireEvent('select', soc, soc.getStore().getAt(index), index);
						buk.setValue(lastOptions.params.ekorg);
					}
					soc.disable();
					buk.disable();

					var totalField = Ext.get('divTotalD');
					totalField.dom.innerHTML = Ext.util.Format.usMoney(total);
					winSelect.hide();
					listaFacturaStore.removeAll();
					console.log(Ext.getCmp('cmbReceptionTypeField').getValue());
					console.log(Ext.getCmp('monedaCmb').getValue());
					Ext.getCmp('hdnReceptionType').setValue(4);
					//					Ext.getCmp('hdnMoneda').setValue(Ext.getCmp('currency').getValue());
					formListaFactura.getForm().reset();
					var totalFieldS = Ext.get('divTotal');
					totalFieldS.dom.innerHTML = Ext.util.Format.usMoney('0');
				}
			});

			var gridListaFac;
			if (visualizaImporte) {
				gridListaFac = new Ext.grid.EditorGridPanel({
					store: listaFacturaStore,
					tbar: ['->', {
						xtype: 'tbbutton',
						text: bundle.getMsg('label.selectall'),
						handler: function() {
							listaFacturaStore.each(function(record) {
								record.set('select', true);
							});
						}
					}],
					columns: [new Ext.grid.RowNumberer(),
					{ header: bundle.getMsg('label.purchaseorder'), width: 80, dataIndex: 'ebeln', sortable: true, align: 'center' }, //orden de compra
					{ header: bundle.getMsg('label.position'), width: 60, dataIndex: 'ebelp', sortable: true, align: 'center' }, //posicion
					{ header: bundle.getMsg('label.docnum'), width: 80, dataIndex: 'mblnr', sortable: true, align: 'center' }, //no. docto
					{ header: bundle.getMsg('label.reference'), width: 80, dataIndex: 'xblnr', sortable: true, align: 'center' }, //referencia
					{ header: bundle.getMsg('label.date'), width: 80, dataIndex: 'aedat', sortable: true, align: 'center' }, //fecha
					{ header: 'Material', width: 100, dataIndex: 'matnr', sortable: true, align: 'center' }, //Material
					{ header: 'UN', width: 30, dataIndex: 'meins', sortable: true, align: 'center' }, //UN
					{ header: bundle.getMsg('label.description'), width: 200, dataIndex: 'txz01', sortable: true, align: 'center' }, //Descripción
					{ header: bundle.getMsg('label.authamount'), width: 80, dataIndex: 'menge', sortable: true, align: 'center' }, //Ctd. Aut.
					{ header: bundle.getMsg('label.recamount'), width: 80, dataIndex: 'zmenge', editor: new Ext.form.TextField({ allowBlank: false }), sortable: true, align: 'center' }, //Ctd. Rec.
					{ header: bundle.getMsg('label.unitprice'), width: 50, dataIndex: 'punit', sortable: true, align: 'center' }, //Ctd. Aut.
					{
						header: bundle.getMsg('label.amountwotax'), width: 140, dataIndex: 'netwr', sortable: true, align: 'center', renderer: function(value, metaData, record) {
							record.data.netwr = record.data.zmenge * record.data.punit;
							return Ext.util.Format.usMoney(record.data.zmenge * record.data.punit);
						}
					}, //Importe Sin IVA
					{ header: bundle.getMsg('label.currency'), width: 50, dataIndex: 'waers', sortable: true, align: 'center' }, //Moneda			          
					{ header: bundle.getMsg('label.select'), width: 80, sortable: false, align: 'center', dataIndex: 'select', xtype: 'checkcolumn' }
					],
					viewConfig: { forceFit: true },
					border: false,
					bbar: [{ xtype: 'tbtext', text: 'Total:' }, '->', { tag: 'div', id: 'divTotal', style: 'height:20px;width:100px;border:1px solid;margin-right:120px' }],
					stripeRows: true,
					height: 300,
					columnLines: true,
					autoScroll: true,
					loadMask: true,
					selModel: new Ext.grid.RowSelectionModel({ singleSelect: true })
				});

			} else {
				gridListaFac = new Ext.grid.EditorGridPanel({
					store: listaFacturaStore,
					tbar: ['->', {
						xtype: 'tbbutton',
						text: bundle.getMsg('label.selectall'),
						handler: function() {
							listaFacturaStore.each(function(record) {
								record.set('select', true);
							});
						}
					}],
					columns: [new Ext.grid.RowNumberer(),
					{ header: bundle.getMsg('label.purchaseorder'), width: 80, dataIndex: 'ebeln', sortable: true, align: 'center' }, //orden de compra
					{ header: bundle.getMsg('label.position'), width: 60, dataIndex: 'ebelp', sortable: true, align: 'center' }, //posicion
					{ header: bundle.getMsg('label.docnum'), width: 80, dataIndex: 'mblnr', sortable: true, align: 'center' }, //no. docto
					{ header: bundle.getMsg('label.reference'), width: 80, dataIndex: 'xblnr', sortable: true, align: 'center' }, //referencia
					{ header: bundle.getMsg('label.date'), width: 80, dataIndex: 'aedat', sortable: true, align: 'center' }, //fecha
					{ header: 'Material', width: 100, dataIndex: 'matnr', sortable: true, align: 'center' }, //Material
					{ header: 'UN', width: 30, dataIndex: 'meins', sortable: true, align: 'center' }, //UN
					{ header: bundle.getMsg('label.description'), width: 200, dataIndex: 'txz01', sortable: true, align: 'center' }, //Descripción
					{ header: bundle.getMsg('label.authamount'), width: 80, dataIndex: 'menge', sortable: true, align: 'center' }, //Ctd. Aut.
					{ header: bundle.getMsg('label.recamount'), width: 80, dataIndex: 'zmenge', editor: new Ext.form.TextField({ allowBlank: false }), sortable: true, align: 'center' }, //Ctd. Rec.
					{ header: bundle.getMsg('label.unitprice'), hidden: true, width: 50, dataIndex: 'punit', sortable: true, align: 'center' }, //Ctd. Aut.
					{
						header: bundle.getMsg('label.amountwotax'), hidden: true, width: 140, dataIndex: 'netwr', sortable: true, align: 'center', renderer: function(value, metaData, record) {
							record.data.netwr = record.data.zmenge * record.data.punit;
							return Ext.util.Format.usMoney(record.data.zmenge * record.data.punit);
						}
					}, //Importe Sin IVA
					{ header: bundle.getMsg('label.currency'), width: 50, dataIndex: 'waers', sortable: true, align: 'center' }, //Moneda			          
					{ header: bundle.getMsg('label.select'), width: 80, sortable: false, align: 'center', dataIndex: 'select', xtype: 'checkcolumn' }
					],
					viewConfig: { forceFit: true },
					border: false,
					bbar: [{ xtype: 'tbtext', text: 'Total:', hidden: true }, '->', { tag: 'div', id: 'divTotal', style: 'height:20px;width:100px;border:1px solid;margin-right:120px', hidden: true }],
					stripeRows: true,
					height: 300,
					columnLines: true,
					autoScroll: true,
					loadMask: true,
					selModel: new Ext.grid.RowSelectionModel({ singleSelect: true })
				});
			}

			var sociedad = Ext.getCmp('cmbRazonSocial');
			var bukrsField = Ext.getCmp('cmbDivision');
			if (sociedad.getValue()) {
				razonSocialFieldS.setValue(sociedad.getValue());
				var index = sociedad.getStore().find('bukrs', sociedad.getValue());
				razonSocialFieldS.fireEvent('select', razonSocialFieldS, razonSocialFieldS.getStore().getAt(index), index);
				if (bukrsField.getValue()) {
					divisionS.setValue(bukrsField.getValue());
				}
			}

			gridListaFac.on('validateedit', function(e) {
				if (e.value > e.record.data.menge) {
					e.cancel = true;
					Ext.Msg.alert('Mensaje', 'Cantidad recibida no puede ser mayor a la autorizada');
				}
			});

			gridListaFac.on('beforeedit', function(e) {
				if (!isPartialVisible) {
					e.cancel = true;
				}
			});

			gridListaFac.getStore().on('update', function(t, r, o) {
				total = 0;

				t.each(function(record) {
					if (record.data.select) {
						total = total + (record.data.netwr * 1);
					}
				});
				var totalField = Ext.get('divTotal');
				totalField.dom.innerHTML = Ext.util.Format.usMoney(total);

			});

			var cm = new Ext.grid.ColumnModel({
				defaults: {
					sortable: false,
					menuDisabled: true
				},
				columns: [{
					id: 'factura',
					header: bundle.getMsg('label.purchaseordernumber'),
					dataIndex: 'Facs',
					editor: new Ext.form.TextField({
						allowBlank: false,
						maxLength: 10,
						// minLength: 10,
						maskRe: /[0-9.]/
						// autoCreate: {
						// tag: 'input',
						// type: 'text',

						// }
					})
				}, {
					xtype: 'actioncolumn',
					width: 30,
					menuDisabled: true,
					items: [{
						icon: contextrootpath + "/resources/img/delete.png",
						handler: function(grid, rowIndex, colIndex) {
							storeFacTmp.removeAt(rowIndex);
						}
					}]
				}]
			});

			var storeFacTmp = new Ext.data.SimpleStore({
				idProperty: 'status',
				fields: ['Facs', 'eliminar'],
				data: [],
				listeners: {
					// add: function(t,records,index, eOpts) {
					// for(var i in records) {
					// var idx = t.findExact('Facs',records[i].get('Facs'));
					// if(idx != -1 && idx < index) 
					// t.remove(records[i]);
					// }	
					// }
				}
			});

			var gridFactura = new Ext.grid.EditorGridPanel({
				store: storeFacTmp,
				title: bundle.getMsg('label.purchaseordernumber'),
				id: 'gridFactura',
				cm: cm,
				width: 300,
				height: 200,
				autoExpandColumn: 'factura',
				clicksToEdit: 1,
				tbar: [{
					text: bundle.getMsg('label.addpurchaseorder'),
					handler: function() {
						var fac = gridFactura.getStore().recordType;
						var f = new fac({
							Facs: '',
							eliminar: ''
						});
						gridFactura.stopEditing();
						storeFacTmp.insert(0, f);
						gridFactura.startEditing(0, 0);
					}
				}],
				listeners: {
					afteredit: function(e) {
						console.log(e);
						var idx = e.grid.getStore().findExact('Facs', e.value, 1);
						if (idx != -1 && idx != e.row) {
							e.grid.getStore().removeAt(e.row);
						}
					}
				}
			});

			if (!listarDivision) {
				divisionS.hide();
			}

			var formListaFactura = Ext.getCmp('listaFacturasForm') || new Ext.form.FormPanel({
				title: bundle.getMsg('label.orderbuywithinvoice'),
				id: 'listaFacturasForm',
				method: 'POST',
				bodyStyle: 'padding-left: 20px;padding-right: 20px;padding-top: 20px;',
				layout: 'form',
				border: false,
				frame: true,
				renderTo: 'formListaFactura',
				items: [{
					layout: 'column',
					border: false,
					items: [{
						layout: 'form',
						columnWidth: .5,
						border: false,
						items: [
							razonSocialFieldS,
							divisionS,
							{
								layout: 'hbox',
								border: false,
								defaults: { margins: '0 10 0 0' },
								items: [{
									layout: 'form',
									border: false,
									items: [fechaIniS]
								}, {
									layout: 'form',
									border: true,
									labelWidth: 25,
									items: [fechaFinS]
								}]
							},
							//								   receptionTypeField,
							monedaCmb
						]
					}, {
						layout: 'form',
						border: false,
						columnWidth: .5,
						items: [gridFactura]
					}]
				}],
				buttonAlign: 'left',
				buttons: [{
					id: 'filtrar',
					text: bundle.getMsg('label.filter'),
					type: 'button',
					handler: filtrarFacturas,
					style: {
						marginLeft: '15px'
					}
				}]
			});
			Ext.getCmp('cmbReceptionTypeField').setValue(1);

			var winSelect = Ext.getCmp('winSelection') || new Ext.Window({
				id: 'winSelection',
				title: 'Selección de Documentos',
				frame: true,
				layout: 'form',
				closeAction: 'hide',
				width: 1050,
				modal: true,
				items: [formListaFactura, gridListaFac, btnAgregarDoc]
			});
			winSelect.show();
		}
