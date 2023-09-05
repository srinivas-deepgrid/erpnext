// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Department", {
	onload: function(frm) {
		console.log("head_of_the_department----");
		frm.set_query("parent_department", function() {
			return {"filters": [["Department", "is_group", "=", 1]]};
		});
	},
	refresh: function(frm) {
		// read-only for root department
		if(!frm.doc.parent_department && !frm.is_new()) {
			frm.set_read_only();
			frm.set_intro(__("This is a root department and cannot be edited."));
		}
	},
	validate: function(frm) {
		if(frm.doc.name=="All Departments") {
			frappe.throw(__("You cannot edit root node."));
		}
	}	
});

// frappe.ui.form.on("Department", {
//     onload: function(frm) {
//         frm.set_query("parent_department", function() {
//             return {"filters": [["Department", "is_group", "=", 1]]};
//         });
//     },
//     refresh: function(frm) {
//         // read-only for root department
//         if (!frm.doc.parent_department && !frm.is_new()) {
//             frm.set_read_only();
//             frm.set_intro(__("This is a root department and cannot be edited."));
//         }
//     },
//     validate: function(frm) {
//         if (frm.doc.name == "All Departments") {
//             frappe.throw(__("You cannot edit root node."));
//         }
//     },
//     head_of_the_department: function(frm) {
//         var hod_employee = frm.doc.head_of_the_department;
//         if (hod_employee) {
//             frappe.call({
//                 method: 'frappe.client.get_value',
//                 args: {
//                     doctype: 'Employee',
//                     filters: { name: hod_employee },
//                     fieldname: 'employee_name'
//                 },
//                 callback: function(response) {
//                     var hod_name = response.message.employee_name;
//                     frm.set_value('hod_name', hod_name);
//                 }
//             });
//         }
//     }
// });

