// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.provide("erpnext.setup");
erpnext.setup.EmployeeController = class EmployeeController extends frappe.ui.form.Controller {
	setup() {
		this.frm.fields_dict.user_id.get_query = function(doc, cdt, cdn) {
			return {
				query: "frappe.core.doctype.user.user.user_query",
				filters: {ignore_user_type: 1}
			}
		}
		this.frm.fields_dict.reports_to.get_query = function(doc, cdt, cdn) {
			return { query: "erpnext.controllers.queries.employee_query"} }
	}

	refresh() {
		erpnext.toggle_naming_series();
	}

	salutation() {
		if (this.frm.doc.salutation) {
			this.frm.set_value("gender", {
				"Mr": "Male",
				"Ms": "Female"
			}[this.frm.doc.salutation]);
		}
	}

};

frappe.ui.form.on("Employee", {
	onload: function (frm) {
		frm.set_query("department", function() {
			return {
				"filters": {
					"company": frm.doc.company,
				}
			};
		});
		frm.trigger('today_shift');
	},
	prefered_contact_email: function(frm) {
		frm.events.update_contact(frm);
	},

	personal_email: function(frm) {
		frm.events.update_contact(frm);
	},

	company_email: function(frm) {
		frm.events.update_contact(frm);
	},

	user_id: function(frm) {
		frm.events.update_contact(frm);
	},

	update_contact: function(frm) {
		var prefered_email_fieldname = frappe.model.scrub(frm.doc.prefered_contact_email) || 'user_id';
		frm.set_value("prefered_email",
			frm.fields_dict[prefered_email_fieldname].value);
	},

	status: function(frm) {
		return frm.call({
			method: "deactivate_sales_person",
			args: {
				employee: frm.doc.employee,
				status: frm.doc.status
			}
		});
	},

	create_user: function(frm) {
		if (!frm.doc.prefered_email) {
			frappe.throw(__("Please enter Preferred Contact Email"));
		}
		frappe.call({
			method: "erpnext.setup.doctype.employee.employee.create_user",
			args: {
				employee: frm.doc.name,
				email: frm.doc.prefered_email
			},
			callback: function (r) {
				frm.set_value("user_id", r.message);
			}
		});
	},

	setup : function (frm) {

		console.log("Employee doc set up ")
		console.log("reporting_incharge------1",frm.doc.reporting_incharge)
		frm.trigger('hod');

		frm.set_query("reporting_incharge", function() {
			return {
				query: "hrms.hr.doctype.department_approver.department_approver.get_approvers",
				filters: {
					employee: frm.doc.employee,
					doctype: "Shift Request"
				}
			};
		});
		console.log("reporting_incharge------2",frm.doc.reporting_incharge)
	},

	default_shift: function(frm) {
        frappe.call({
            method: 'set_shift_cycle',
            doc: frm.doc,
			// if doc: frm.doc is not included it throws error
			// Failed to get method for command set_shift_cycle with 'set_shift_cycle'
            callback: function(response) {
                if (response.message) {
                    frm.set_value('shift_cycle', response.message);
					refresh_field('shift_cycle');
					frm.trigger('shift_cycle');
                }
            }
        });
    },

    shift_cycle: function(frm) {
        frm.set_value('shift_assigned_on', frappe.datetime.now_datetime());
	refresh_field('shift_assigned_on');
	frm.trigger('today_shift');
    },

	today_shift: function(frm) {
		var shift_cycle = frm.doc.shift_cycle;
    	if (!shift_cycle) {
        	// If shift_cycle is empty or not selected
        	frm.set_value('today_shift', '');
        	refresh_field('today_shift');
        	 if(!frm.doc.__islocal){
                        frm.save();
                  }
		return;
    	}

        frappe.call({
            method: 'erpnext.setup.doctype.employee.employee.get_shift_based_on_shift_cycle',
            args : {
				shift_cycle : shift_cycle
			},
            callback: function(response) {
                if (response.message) {
                    frm.set_value('today_shift', response.message);
		    refresh_field('today_shift');
		    if(!frm.doc.__islocal){
 			frm.save();
		     }
                }
            }
        });
    },

	hod:function(frm){
		if(frm.doc.hod){
			frm.set_df_property("hod_allowances", "hidden", false);
		}else{
			frm.set_value('hod_allowances',0)
			refresh_field('hod_allowances')
			frm.set_df_property("hod_allowances", "hidden", true);
		}
	}
});

cur_frm.cscript = new erpnext.setup.EmployeeController({
	frm: cur_frm
});


frappe.tour['Employee'] = [
	{
		fieldname: "first_name",
		title: "First Name",
		description: __("Enter First and Last name of Employee, based on Which Full Name will be updated. IN transactions, it will be Full Name which will be fetched.")
	},
	{
		fieldname: "company",
		title: "Company",
		description: __("Select a Company this Employee belongs to.")
	},
	{
		fieldname: "date_of_birth",
		title: "Date of Birth",
		description: __("Select Date of Birth. This will validate Employees age and prevent hiring of under-age staff.")
	},
	{
		fieldname: "date_of_joining",
		title: "Date of Joining",
		description: __("Select Date of joining. It will have impact on the first salary calculation, Leave allocation on pro-rata bases.")
	},
	{
		fieldname: "reports_to",
		title: "Reports To",
		description: __("Here, you can select a senior of this Employee. Based on this, Organization Chart will be populated.")
	},
];
