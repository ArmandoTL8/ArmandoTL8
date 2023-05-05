var total;
var isVisible = true;
var razonSocialStore = new Ext.data.JsonStore({
	root: 'data',
	fields: ['bukrs', 'butxt'],
	autoLoad: true,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/razonSocial.action', method: 'GET' })
});

var divisionStore = new Ext.data.JsonStore({
	root: 'data',
	fields: ['segment', 'name'],
	autoLoad: false,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/division.action', method: 'GET' })
});

var listaFacturaStore = new Ext.data.JsonStore({
	root: 'data',
	fields: [
		{ name: 'ebeln' },
		{ name: 'ebelp' },
		{ name: 'mblnr' },
		{ name: 'aedat' },
		{ name: 'matnr' },
		{ name: 'meins' },
		{ name: 'txz01' },
		{ name: 'menge' },
		{ name: 'xblnr' },
		{ name: 'zmenge' },
		{ name: 'netwr' },
		{ name: 'waers' },
		{ name: 'punit' },
		{ name: 'invoiceDocItem' },
		{ name: 'poNumber' },
		{ name: 'poItem' },
		{ name: 'refDoc' },
		{ name: 'refDocYear' },
		{ name: 'refDocIt' },
		{ name: 'itemAmount' },
		{ name: 'quantity' },
		{ name: 'poUnit' },
		{ name: 'poPrQnt' },
		{ name: 'poPrUom' },
		{ name: 'condType' },
		{ name: 'sheetNo' },
		{ name: 'sheetItem' },
		{ name: 'packno' },
		{ name: 'introw' },
		{ name: 'zekkn' },
		{ name: 'select', type: 'bool' }
	],
	autoLoad: false,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/listPendingInvoice.action', method: 'GET' }),
	listeners: {
		exception: utilities.handleException
	}
});

var listaFacturaStoreD = new Ext.data.JsonStore({
	root: 'data',
	fields: [
		{ name: 'ebeln' },
		{ name: 'ebelp' },
		{ name: 'mblnr' },
		{ name: 'aedat' },
		{ name: 'matnr' },
		{ name: 'meins' },
		{ name: 'txz01' },
		{ name: 'menge' },
		{ name: 'xblnr' },
		{ name: 'zmenge' },
		{ name: 'netwr' },
		{ name: 'waers' },
		{ name: 'punit' },
		{ name: 'invoiceDocItem' },
		{ name: 'poNumber' },
		{ name: 'poItem' },
		{ name: 'refDoc' },
		{ name: 'refDocYear' },
		{ name: 'refDocIt' },
		{ name: 'itemAmount' },
		{ name: 'quantity' },
		{ name: 'poUnit' },
		{ name: 'poPrQnt' },
		{ name: 'poPrUom' },
		{ name: 'condType' },
		{ name: 'sheetNo' },
		{ name: 'sheetItem' },
		{ name: 'packno' },
		{ name: 'introw' },
		{ name: 'zekkn' },
		{ name: 'select', type: 'bool' }
	],
	autoLoad: false,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/listPendingInvoice.action', method: 'GET' }),
	listeners: {
		exception: utilities.handleException
	}
});

var currencyStore = new Ext.data.JsonStore({
	root: 'data',
	fields: ['ltext', 'waers'],
	autoLoad: true,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/currency.action', method: 'GET' })
});

var taxListStore = new Ext.data.JsonStore({
	root: 'data',
	fields: ['bukrs', 'kalsm', 'mwskz', 'taxper', 'text1'],
	autoLoad: false,
	proxy: new Ext.data.HttpProxy({ url: contextrootpath + '/provider/taxList.action', method: 'GET' })
});

Ext.onReady(function() {

	Ext.QuickTips.init();

	Ext.form.Field.prototype.msgTarget = 'side';
	var lang;
	var params = Ext.urlDecode(window.location.search.substring(1));
	lang = params.language ? params.language : 'es';
	bundle = new Ext.i18n.Bundle({ bundle: 'messages', path: contextrootpath + '/resources/language', lang: lang });
	bundle.onReady(function() {

		var razonSocialField = new Ext.form.ComboBox({
			triggerAction: 'all',
			id: 'cmbRazonSocial',
			name: 'cmbRazonSocial',
			store: razonSocialStore,
			editable: false,
			fieldLabel: bundle.getMsg('label.company'),
			valueField: 'bukrs',
			displayField: 'butxt',
			hiddenName: 'hdnRazonSocial',
			mode: 'local',
			allowBlank: false,
			width: 400,
			listeners: {
				select: function(c, rec, index) {
					if (listarDivision) {
						divisionStore.load({
							params: {
								bukrs: rec.data.bukrs
							}
						});
						division.enable();
						division.clearValue();
					}

					taxListStore.load({
						params: {
							bukrs: rec.data.bukrs
						}
					});
					ivaCmb.enable();
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
					//ivaCmb.clearValue();
				}
			}
		});

		var division = new Ext.form.ComboBox({
			triggerAction: 'all',
			id: 'cmbDivision',
			name: 'cmbDivision',
			store: divisionStore,
			disabled: true,
			fieldLabel: bundle.getMsg('label.division'),
			valueField: 'name',
			hiddenName: 'hdnDivision',
			displayField: 'segment',
			mode: 'local',
			allowBlank: true,
			width: 250
		});

		var uploadPDF = new Ext.ux.form.FileUploadField({
			fieldLabel: bundle.getMsg('label.pdffile'),
			name: 'file',
			buttonText: bundle.getMsg('label.pickfile'),
			allowBlank: false,
			regex: /^.*\.(pdf|PDF)$/,
			regexText: bundle.getMsg('label.onlypdf'),
			width: 400
		});

		var facturaField = new Ext.form.TextField({
			fieldLabel: bundle.getMsg('label.invoice'),
			id: 'invoice',
			name: 'invoice',
			allowBlank: false,
			width: 200
		});
		var d = new Date(new Date().getFullYear(), 0, 1);
		var fechaFactura = new Ext.form.DateField({
			fieldLabel: bundle.getMsg('label.invoicedate'),
			id: 'fechaInvoice',
			name: 'fechaInvoice',
			allowBlank: false,
			minValue: d,
			format: 'Y-m-d',
			width: 130
		});

		var ivaCmb = new Ext.form.ComboBox({
			id: 'ivaCmb',
			name: 'ivaCmb',
			store: taxListStore,
			editable: false,
			fieldLabel: bundle.getMsg('label.tax'),
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			forceSelection: true,
			allowBlank: false,
			selectOnFocus: true,
			disabled: true,
			hiddenName: 'hdnIva',
			valueField: 'taxper',
			displayField: 'text1',
			width: 400
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

		var retencionesField = new Ext.form.TextField({
			fieldLabel: bundle.getMsg('label.retentions'),
			id: 'retenciones',
			name: 'retenciones',
			allowBlank: false,
			width: 200
		});

		var referenciaField = new Ext.form.TextField({
			fieldLabel: bundle.getMsg('label.reference'),
			id: 'referencia',
			name: 'referencia',
			allowBlank: true,
			width: 200
		});

		var subTotalField = new Ext.form.TextField({
			fieldLabel: 'Subtotal',
			id: 'subtotal',
			name: 'subtotal',
			allowBlank: false,
			width: 200
		});
		var otherPDF = new Ext.ux.form.FileUploadField({
			fieldLabel: bundle.getMsg('label.otherpdffile'),
			name: 'file',
			id: 'other_pdf_doc',
			buttonText: bundle.getMsg('label.pickfile'),
			allowBlank: true,
			regex: /^.*\.(pdf|PDF)$/,
			regexText: bundle.getMsg('label.onlypdf'),
			width: 400
		});
		var repsePDF = new Ext.ux.form.FileUploadField({
			fieldLabel: bundle.getMsg('label.repse'),
			name: 'file',
			id: 'pdf_repse',
			buttonText: bundle.getMsg('label.pickfile'),
			allowBlank: false,
			regex: /^.*\.(pdf)$/i,
			regexText: 'Solo archivos PDF',
			width: 400
		});

		var repse_flg = new Ext.form.TextField({
			fieldLabel: 'REPSE',
			id: 'repse_flg',
			width: 120,
			hidden: true,
			disabled: true,
			allowBlank: true,
			hiddenName: 'hdnRepse',
		});

		var cm = new Ext.grid.ColumnModel({
			defaults: {
				sortable: false,
				menuDisabled: true
			},
			columns: [{
				id: 'factura',
				header: bundle.getMsg('label.reference'),
				dataIndex: 'Facs',
				editor: new Ext.form.TextField({
					allowBlank: false,
					autoCreate: {
						tag: 'input',
						type: 'text',
						maxlength: 16
					}
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
			data: []
		});

		var gridFactura = new Ext.grid.EditorGridPanel({
			store: storeFacTmp,
			id: 'gridFactura',
			cm: cm,
			width: 400,
			height: 300,
			autoExpandColumn: 'factura',
			clicksToEdit: 1,
			tbar: [{
				text: bundle.getMsg('label.addreference'),
				handler: function() {
					var fac = gridFactura.getStore().recordType;
					var f = new fac({
						factura: 'Nueva referencia'
					});
					gridFactura.stopEditing();
					storeFacTmp.insert(0, f);
					gridFactura.startEditing(0, 0);
				}
			}]
		});

		var btnSelectDoc = new Ext.Button({
			text: bundle.getMsg('label.selectpurchaseorders'),
			handler: windowSelection
		});

		var gridListaFacD;
		if (visualizaImporte) {
			gridListaFacD = new Ext.grid.GridPanel({
				store: listaFacturaStoreD,
				columns: [new Ext.grid.RowNumberer(),
				{ header: bundle.getMsg('label.purchaseorder'), width: 80, dataIndex: 'ebeln', sortable: true, align: 'center' }, //orden de compra
				{ header: bundle.getMsg('label.position'), width: 60, dataIndex: 'ebelp', sortable: true, align: 'center' }, //posicion
				{ header: bundle.getMsg('label.docnum'), width: 80, dataIndex: 'mblnr', sortable: true, align: 'center' }, //no. docto
				{ header: bundle.getMsg('label.reference'), width: 80, dataIndex: 'xblnr', sortable: true, align: 'center' }, //referencia
				{ header: bundle.getMsg('label.date'), width: 80, dataIndex: 'aedat', sortable: true, align: 'center' }, //fecha
				{ header: 'Material', width: 100, dataIndex: 'matnr', sortable: true, align: 'center' }, //Material
				{ header: 'UN', width: 50, dataIndex: 'meins', sortable: true, align: 'center' }, //UN
				{ header: bundle.getMsg('label.description'), width: 200, dataIndex: 'txz01', sortable: true, align: 'center' }, //Descripción
				{ header: bundle.getMsg('label.authamount'), width: 60, dataIndex: 'menge', sortable: true, align: 'center' }, //Ctd. Aut.
				{ header: bundle.getMsg('label.recamount'), width: 80, dataIndex: 'zmenge', editor: new Ext.form.TextField({ allowBlank: false }), sortable: true, align: 'center' }, //Ctd. Rec.
				{
					header: bundle.getMsg('label.amountwotax'), width: 100, dataIndex: 'netwr', sortable: true, align: 'center', renderer: function(value, metaData, record) {
						record.data.netwr = record.data.zmenge * record.data.punit;
						record.data.netwr = record.data.netwr.toFixed(2);
						return Ext.util.Format.usMoney(record.data.zmenge * record.data.punit);
					}
				}, //Importe Sin IVA
				{ header: bundle.getMsg('label.currency'), width: 100, dataIndex: 'waers', sortable: true, align: 'center' } //Moneda
				],
				viewConfig: { forceFit: true },
				border: false,
				bbar: [{ xtype: 'tbtext', text: 'Total:' }, '->', { tag: 'div', id: 'divTotalD', style: 'height:20px;width:100px;border:1px solid;margin-right:120px' }],
				stripeRows: true,
				height: 300,
				columnLines: true,
				autoScroll: true,
				loadMask: true,
				selModel: new Ext.grid.RowSelectionModel({ singleSelect: true })
			});

		} else {
			gridListaFacD = new Ext.grid.GridPanel({
				store: listaFacturaStoreD,
				columns: [new Ext.grid.RowNumberer(),
				{ header: bundle.getMsg('label.purchaseorder'), width: 80, dataIndex: 'ebeln', sortable: true, align: 'center' }, //orden de compra
				{ header: bundle.getMsg('label.position'), width: 60, dataIndex: 'ebelp', sortable: true, align: 'center' }, //posicion
				{ header: bundle.getMsg('label.docnum'), width: 80, dataIndex: 'mblnr', sortable: true, align: 'center' }, //no. docto
				{ header: bundle.getMsg('label.reference'), width: 80, dataIndex: 'xblnr', sortable: true, align: 'center' }, //referencia
				{ header: bundle.getMsg('label.date'), width: 80, dataIndex: 'aedat', sortable: true, align: 'center' }, //fecha
				{ header: 'Material', width: 100, dataIndex: 'matnr', sortable: true, align: 'center' }, //Material
				{ header: 'UN', width: 50, dataIndex: 'meins', sortable: true, align: 'center' }, //UN
				{ header: bundle.getMsg('label.description'), width: 200, dataIndex: 'txz01', sortable: true, align: 'center' }, //Descripción
				{ header: bundle.getMsg('label.authamount'), width: 60, dataIndex: 'menge', sortable: true, align: 'center' }, //Ctd. Aut.
				{ header: bundle.getMsg('label.recamount'), width: 80, dataIndex: 'zmenge', editor: new Ext.form.TextField({ allowBlank: false }), sortable: true, align: 'center' }, //Ctd. Rec.
				{
					header: bundle.getMsg('label.amountwotax'), hidden: true, width: 100, dataIndex: 'netwr', sortable: true, align: 'center', renderer: function(value, metaData, record) {
						record.data.netwr = record.data.zmenge * record.data.punit;
						record.data.netwr = record.data.netwr.toFixed(2);
						return Ext.util.Format.usMoney(record.data.zmenge * record.data.punit);
					}
				}, //Importe Sin IVA
				{ header: bundle.getMsg('label.currency'), width: 100, dataIndex: 'waers', sortable: true, align: 'center' } //Moneda
				],
				viewConfig: { forceFit: true },
				border: false,
				bbar: [{ xtype: 'tbtext', text: 'Total:', hidden: true }, '->', { tag: 'div', id: 'divTotalD', style: 'height:20px;width:100px;border:1px solid;margin-right:120px', hidden: true }],
				stripeRows: true,
				height: 300,
				columnLines: true,
				autoScroll: true,
				loadMask: true,
				selModel: new Ext.grid.RowSelectionModel({ singleSelect: true })
			});
		}

		if (!repse) {
			repsePDF.hide();
		}
		if (!servicios) {
			repsePDF.hide();
		}

		if (!listarDivision) {
			division.hide();
		}
		//		var formCFDI;
		//		if(isVisible) {
		//			formCFDI = new Ext.form.FormPanel({
		//				title: bundle.getMsg('label.cbbtitle'),
		//				id: 'cbbForm',
		//				fileUpload: true,
		//				method: 'POST',
		//				bodyStyle: 'padding: 10px 10px 0 10px;',		
		//				frame: true,
		//				defaults: {
		//					msgTarget: 'side',
		//					anchor: '95%',
		//					labelWidth: 120,
		//				},
		//				border: false,
		//				renderTo: 'formListaFactura',
		//				items:[{
		//					layout: 'form',
		//					border: false,
		//					items:[
		//					       razonSocialField,
		//					       division,
		////					       referenciaField,
		//					       uploadPDF,					       
		//					       facturaField,
		//					       fechaFactura,
		//					       ivaCmb,
		//					       btnSelectDoc,
		//					       gridListaFacD,{
		//					    	   xtype: 'hidden',
		//					    	   name: 'hdnFacturas',
		//					    	   id: 'hdnFacturas'
		//					      },{
		//					    	   xtype: 'hidden',
		//					    	   name: 'flag',
		//					    	   id: 'flag'
		//					       },{ 
		//					    	   xtype: 'hidden',
		//					    	   name: 'subto',
		//					    	   id: 'subto'
		//					       },{
		//					    	   xtype: 'hidden',
		//					    	   name: 'receptionType',
		//					    	   id: 'hdnReceptionType'
		//					       },{
		//					    	   xtype: 'hidden',
		//					    	   name: 'moneda',
		//					    	   id: 'hdnMoneda'
		//					       }
		//					       ]
		//				}],
		//				buttonAlign: 'left',
		//				buttons:[{
		//					id: 'enviar',
		//					text: bundle.getMsg('label.send'),
		//					type: 'button',
		//					handler: enviarCFDI,
		//					style: {
		//						marginLeft : '15px'
		//					}
		//				}]
		//			});	
		//			
		//		} else {
		//			formCFDI = new Ext.form.FormPanel({
		//				title: bundle.getMsg('label.cbbtitle'),
		//				id: 'cbbForm',
		//				fileUpload: true,
		//				method: 'POST',
		//				bodyStyle: 'padding: 10px 10px 0 10px;',		
		//				frame: true,
		//				defaults: {
		//					msgTarget: 'side',
		//					anchor: '95%',
		//					labelWidth: 120,
		//				},
		//				border: false,
		//				renderTo: 'formListaFactura',
		//				items:[{
		//					layout: 'form',
		//					border: false,
		//					items:[
		//					       razonSocialField,
		//					       division,
		//					       referenciaField,
		//					       uploadPDF,
		//					       otherPDF,
		//					       facturaField,
		//					       fechaFactura,
		//					       ivaCmb,
		////					       retencionesField,
		//					       monedaCmb,
		////					       referenciaField,
		//					       subTotalField
		//					       ,
		//					       gridFactura,{
		//					    	   xtype: 'hidden',
		//					    	   name: 'hdnFacturas',
		//					    	   id: 'hdnFacturas'
		//					       }
		//					       ]
		//				}],
		//				buttonAlign: 'left',
		//				buttons:[{
		//					id: 'enviar',
		//					text: bundle.getMsg('label.send'),
		//					type: 'button',
		//					handler: enviarCFDI,
		//					style: {
		//						marginLeft : '15px'
		//					}
		//				}]
		//			});	
		//		}

		var formCFDI;
		if (isVisible) {
			if (repse || servicios) {
				formCFDI = new Ext.form.FormPanel({
					title: bundle.getMsg('label.cbbtitle'),
					id: 'cbbForm',
					fileUpload: true,
					method: 'POST',
					bodyStyle: 'padding: 10px 10px 0 10px;',
					frame: true,
					defaults: {
						msgTarget: 'side',
						anchor: '95%',
						labelWidth: 120,
					},
					border: false,
					renderTo: 'formListaFactura',
					items: [{
						layout: 'form',
						border: false,
						items: [
							razonSocialField,
							division,
							//						       referenciaField,
							uploadPDF,
							otherPDF,
							repsePDF,
							repse_flg,
							facturaField,
							//orderNumberField,
							//monedaField,
							//monedaCmb,
							fechaFactura,
							ivaCmb,
							//subTotalField,
							btnSelectDoc,
							gridListaFacD, {
								xtype: 'hidden',
								name: 'hdnFacturas',
								id: 'hdnFacturas'
							}, {
								xtype: 'hidden',
								name: 'flag',
								id: 'flag'
							}, {
								xtype: 'hidden',
								name: 'subto',
								id: 'subto'
							}, {
								xtype: 'hidden',
								name: 'receptionType',
								id: 'hdnReceptionType'
							}, {
								xtype: 'hidden',
								name: 'moneda',
								id: 'hdnMoneda'
							}
						]
					}],
					buttonAlign: 'left',
					buttons: [{
						id: 'enviar',
						text: bundle.getMsg('label.send'),
						type: 'button',
						handler: enviarCFDI,
						style: {
							marginLeft: '15px'
						}
					}]
				});
			}
			else {
				formCFDI = new Ext.form.FormPanel({
					title: bundle.getMsg('label.cbbtitle'),
					id: 'cbbForm',
					fileUpload: true,
					method: 'POST',
					bodyStyle: 'padding: 10px 10px 0 10px;',
					frame: true,
					defaults: {
						msgTarget: 'side',
						anchor: '95%',
						labelWidth: 120,
					},
					border: false,
					renderTo: 'formListaFactura',
					items: [{
						layout: 'form',
						border: false,
						items: [
							razonSocialField,
							division,
							//					       referenciaField,
							uploadPDF,
							otherPDF,
							facturaField,
							//orderNumberField,
							//monedaField,
							monedaCmb,
							fechaFactura,
							ivaCmb,
							subTotalField,
							btnSelectDoc,
							gridListaFacD, {
								xtype: 'hidden',
								name: 'hdnFacturas',
								id: 'hdnFacturas'
							}, {
								xtype: 'hidden',
								name: 'subto',
								id: 'subto'
							}, {
								xtype: 'hidden',
								name: 'receptionType',
								id: 'hdnReceptionType'
							}, {
								xtype: 'hidden',
								name: 'moneda',
								id: 'hdnMoneda'
							}
						]
					}],
					buttonAlign: 'left',
					buttons: [{
						id: 'enviar',
						text: bundle.getMsg('label.send'),
						type: 'button',
						handler: enviarCFDI,
						style: {
							marginLeft: '15px'
						}
					}]
				});
			}
		} else {
			formCFDI = new Ext.form.FormPanel({
				title: bundle.getMsg('label.cbbtitle'),
				id: 'cbbForm',
				fileUpload: true,
				method: 'POST',
				bodyStyle: 'padding: 10px 10px 0 10px;',
				frame: true,
				defaults: {
					msgTarget: 'side',
					anchor: '95%',
					labelWidth: 120,
				},
				border: false,
				renderTo: 'formListaFactura',
				items: [{
					layout: 'form',
					border: false,
					items: [
						razonSocialField,
						division,
						referenciaField,
						uploadPDF,
						otherPDF,
						facturaField,
						//orderNumberField,
						fechaFactura,
						ivaCmb,
						//					       retencionesField,
						monedaCmb,
						//					       referenciaField,
						subTotalField,
						gridFactura, {
							xtype: 'hidden',
							name: 'hdnFacturas',
							id: 'hdnFacturas'
						}
					]
				}],
				buttonAlign: 'left',
				buttons: [{
					id: 'enviar',
					text: bundle.getMsg('label.send'),
					type: 'button',
					handler: enviarCFDI,
					style: {
						marginLeft: '15px'
					}
				}]
			});
		}

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

		function filtrarFacturas() {
			var frm = Ext.getCmp('listaFacturasForm').getForm();
			if (frm.isValid()) {
				var values = frm.getFieldValues();
				console.log(values);
				listaFacturaStore.removeAll();
				var gridData = Ext.getCmp('gridFactura');
				var data = new Array();
				var storeData = gridData.getStore();
				var facturas = "";
				storeData.each(function(record) {
					if (!(typeof record.data.Facs === "undefined"))
						facturas = facturas + record.data.Facs + ",";
				});
				facturas = facturas.substring(0, facturas.length - 1);
				console.log(facturas);
				listaFacturaStore.load({
					params: {
						bukrs: values.hdnbukrs,
						ekorg: values.cmbDivisionS,
						ebeln: values.ebeln,
						fechaIni: values.fechaIniS.format('Y-m-d'),
						fechaFin: values.fechaFinS.format('Y-m-d'),
						currency: values.hdnMoneda,
						receptionType: 4,
						hdnOrders: facturas
					}
				});
			} else {
				Ext.MessageBox.show({
					title: bundle.getMsg('label.message'),
					msg: bundle.getMsg('label.alert'),
					icon: Ext.MessageBox.INFO,
					buttons: Ext.MessageBox.OK
				});
			}
		}

		function enviarCFDI() {
			var uploadRepseField;
			var repseFiles;
			Ext.getCmp('cmbRazonSocial').enable();
			Ext.getCmp('cmbDivision').enable();
			var frm = Ext.getCmp('cbbForm').getForm();
			var uploadField = document.getElementById("pdf_doc");
			//			var uploadOtherField = document.getElementById("other_pdf_doc");
			var files = uploadPDF.fileInput.dom.files;
			//			var otherFiles = otherPDF.fileInput.dom.files;
			if (repse || servicios) {
				uploadRepseField = document.getElementById("pdf_repse");
				Ext.getCmp('repse_flg').enable();
				Ext.getCmp('repse_flg').setValue('X');
				repseFiles = repsePDF.fileInput.dom.files;
			}
			if (frm.isValid()) {
				if (files[0].size < 10485760) {
					//					if(otherFiles.length > 0) {
					//						if (otherFiles[0].size > 10485760) {
					//							Ext.MessageBox.show({
					//								title: bundle.getMsg('label.alerttitle'),
					//								msg: 'El archivo PDF excede el tamaño permitido. El tamaño máximo es: 10MB',
					//								buttons: Ext.MessageBox.OK,
					//								icon: Ext.MessageBox.ERROR
					//							});
					////							uploadField.value = "";
					//							uploadOtherField.value = "";
					//							return;
					//						}
					//					}
					var gridData = Ext.getCmp('gridFactura');
					var data = new Array();
					var storeData = gridData.getStore();
					var facturas = "";
					storeData.each(function(record) {
						if (!(typeof record.data.Facs === "undefined"))
							facturas = facturas + record.data.Facs + ",";
					});
					listaFacturaStoreD.each(function(r) {
						data.push(r.data);
					});
					facturas = facturas.substring(0, facturas.length - 1);

					Ext.getCmp('hdnFacturas').setValue(isVisible ? Ext.encode(data) : facturas);
					Ext.getCmp('flag').setValue('4');
					if (Ext.getCmp('subto'))
						Ext.getCmp('subto').setValue(total.toFixed(2));
					//				    Ext.getCmp('subto').setValue(0);

					if (!isVisible ? facturas.length > 0 : true) {
						Ext.Ajax.request({
							url: contextrootpath + '/sessionStatus.action',
							success: function(result, request) {
								if (result.responseText.indexOf("login") >= 0) {
									Ext.MessageBox.alert(bundle.getMsg('label.sessionalerttitle'), bundle.getMsg('label.sessionalert'), relogin);
								} else {
									frm.submit({
										url: contextrootpath + '/oc/addCBB.action',
										waitMsg: bundle.getMsg('label.savingcbb'),
										success: function(form, action) {
											Ext.MessageBox.show({
												title: bundle.getMsg('label.success'),
												msg: action.result.msg,
												buttons: Ext.MessageBox.OK,
												icon: Ext.MessageBox.INFO
											});
											frm.reset();
											storeData.removeAll();
											listaFacturaStoreD.removeAll();
											var totalField = Ext.get('divTotalD');
											totalField.dom.innerHTML = Ext.util.Format.usMoney('0');
										},
										failure: function(form, action) {
											switch (action.failureType) {
												case Ext.form.Action.CLIENT_INVALID:
													Ext.MessageBox.show({
														title: 'Atención',
														msg: 'Valores inválidos',
														buttons: Ext.MessageBox.OK,
														icon: Ext.MessageBox.ERROR
													});
													frm.reset();
													storeData.removeAll();
													listaFacturaStoreD.removeAll();
													var totalField = Ext.get('divTotalD');
													totalField.dom.innerHTML = Ext.util.Format.usMoney('0');
													break;
												case Ext.form.Action.CONNECT_FAILURE:
													Ext.MessageBox.show({
														title: 'Atención',
														msg: 'Falla de comunicación con el servidor',
														buttons: Ext.MessageBox.OK,
														icon: Ext.MessageBox.ERROR
													});
													frm.reset();
													storeData.removeAll();
													listaFacturaStoreD.removeAll();
													var totalField = Ext.get('divTotalD');
													totalField.dom.innerHTML = Ext.util.Format.usMoney('0');
													break;
												case Ext.form.Action.SERVER_INVALID:
													Ext.MessageBox.show({
														title: 'Atención',
														msg: action.result.msg,
														buttons: Ext.MessageBox.OK,
														icon: Ext.MessageBox.ERROR
													});
													frm.reset();
													storeData.removeAll();
													listaFacturaStoreD.removeAll();
													var totalField = Ext.get('divTotalD');
													totalField.dom.innerHTML = Ext.util.Format.usMoney('0');
													break;
												default:
													Ext.MessageBox.show({
														title: 'Atención',
														msg: action.result.msg,
														buttons: Ext.MessageBox.OK,
														icon: Ext.MessageBox.ERROR
													});
													frm.reset();
													storeData.removeAll();
													listaFacturaStoreD.removeAll();
													var totalField = Ext.get('divTotalD');
													totalField.dom.innerHTML = Ext.util.Format.usMoney('0');
													break;
											}
										}
									});
								}
							},
							failure: utilities.expiredSession
						});
					}
				} else {
					Ext.MessageBox.show({
						title: bundle.getMsg('label.alerttitle'),
						msg: 'El archivo PDF excede el tamaño permitido. El tamaño máximo es: 10MB',
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.ERROR
					});
					uploadField.value = "";
					//					uploadOtherField.value = "";
				}
				//			} else {
				//				Ext.MessageBox.show({
				//					title: bundle.getMsg('label.alerttitle'),
				//					msg: bundle.getMsg('label.referenceerror'),
				//					buttons: Ext.MessageBox.OK,
				//					icon: Ext.MessageBox.ERROR
				//				});
			} else {
				if (repse || servicios) {
					if (repseFiles.length == 0) {
						Ext.MessageBox.show({
							title: bundle.getMsg('label.alerttitle'),
							msg: bundle.getMsg('label.repseerror'),
							buttons: Ext.MessageBox.OK,
							icon: Ext.MessageBox.ERROR
						});
						Ext.getCmp('enviar').enable();
						return;
					}
					else {
						Ext.MessageBox.show({
							title: bundle.getMsg('label.alerttitle'),
							msg: bundle.getMsg('label.alert'),
							buttons: Ext.MessageBox.OK,
							icon: Ext.MessageBox.ERROR
						});
						Ext.getCmp('enviar').enable();
						return;
					}
				}
				else {
					Ext.MessageBox.show({
						title: bundle.getMsg('label.alerttitle'),
						msg: bundle.getMsg('label.alert'),
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.ERROR
					});
					Ext.getCmp('enviar').enable();
					return;
				}
			}
		}
		//		}

	});//end bundle


});
