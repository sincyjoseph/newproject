const CSV_TABLE_SORT = 'csv_table_sort'

$(document).ready(function () {
    const dashboardApp = {
        data: [],
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        searchKey: '',
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        user_details: {
            all: 0,
        },

        init() {
            //view data
            $('body').on('click', 'a.view-data', function () {
                const id = $(this).data('id')
                const name = $(this).data('name')
                dashboardApp.renderModal(id, name)
            })

            //edit data
            $('body').on('click', 'a.edit-data', function () {
                const id = $(this).data('id')
                const name = $(this).data('name')
                dashboardApp.editModal(id, name)
            })

            //delete data
            $('body').on('click', 'span.deleteitem', function () {
                const id = $(this).data('id')
                dashboardApp.deleteModel(id)
            })

            let start = moment('2021-01-01')
            let end = moment()

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment('2021-01-01'), moment()],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
            }, this.setDate);

            this.setDate(start, end)

            // Modal
            $('body').on('click', 'a.view-data', function () {
                dashboardApp.url = $(this).data('url')
            })

            // Export button
            $('#export-button').click(function () {
                dashboardApp.downloadExcel()
            })
        },

        setDate(start, end) {
            $('#searchKey').val('');
            dashboardApp.searchKey=''
            if (start.format('MMMM D, YYYY') === 'June 1, 2020') {
                $('#reportrange span').html('Select Date Range');
            } else {
                if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                    if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Today');
                    else if(moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Yesterday');
                    else
                        $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));

                } else
                    $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            dashboardApp.start_date = $('#date_start').val()
            dashboardApp.end_date = $('#date_end').val()
            dashboardApp.getData()
        },
        
        getData() {
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/api/v1/userlist/",
                data: {
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    page: this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.data = res.data
                    this.pagination = res.pagination
                    this.user_details = res.user_details
                    this.renderTable()
                },
                error: (err) => {
                    this.data = []
                    this.user_details = res.user_details
                    this.renderTable()
                }
            })
        },

        renderTable() {
            $('#user_details_all').html(this.user_details.all)
            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.fname}</td>
                        <td>${element.lname}</td>
                        <td>${element.dob}</td>
                        <td>${element.gender}</td>
                        <td>${element.created_datetime}</td>
                        <td class="hover-icons">
                        <a class="view-data hover-icons" data-toggle="modal" data-target="#view-model" data-name="${element.fname} "data-id="${element.id}"><i class="fa fa-eye text-primary" title="View" style="width: 18px;height: 18px"></i></a>
                        <a class="edit-data hover-icons" data-toggle="modal" data-target="#edit-model" data-name="${element.fname} "data-id="${element.id}"><i class="bi bi-pencil-fill" title="Edit" style="width: 18px;height: 18px"></i></a>
                        <span class="archive hover-icons deleteitem"  data-toggle="modal" data-target="" data-id="${element.id}"><a><i class="bi bi-trash-fill"></i></a></span>
                        </td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages
                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" data-county_name="` + '' + `" 
                            data-date_start="`+ 'date_start' + `" data-date_end="` + date_end + `"
                            data-searchKey="`+ 'searchKey' + `" data-searchHealthPlan="`+ 'searchHealthPlan' + `"
                            data-searchEventType="`+ 'searchEventType' + `" data-searchProvider="`+ 'searchProvider' + `">` + (i + 1) + `</li>`;
                        // as we added a page, we reset the separatorAdded
                        separatorAdded = false;
                    } else {
                        if (!separatorAdded) {
                            // only add a separator when it wasn't added before
                            html += `<li class="separator" />`;
                            separatorAdded = true;
                        }
                    }
                }
                $('#holder').html(html)
                document.querySelector('#holder>li[data-page="' + this.page + '"]').classList.add('active')
            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('')
            }
        },

        //view item
        renderModal(id) {
            $('#modal-view-title').html("User Details")
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/user/${id}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },

        //edit item
        editModal(id) {
            $('#modal-edit-title').html("User Details")
            $('#modal-edit-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/user/${id}/`,
                success: (res) => {
                    $('#modal-edit-body').html(res)
                },
                error: () => {
                    $('#modal-edit-body').html('An error occurred while fetching data, Try again')
                }
            })
        },

        //delete item
        deleteModel(id) {
            $.ajax({
                type: "POST",
                url: `/user/delete/`,
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    id: id,
                },
                success: (res) => {
                    if(res.status == 1) {
                        this.getData()
                    } 
                },
                error: () => {
                }
            })
        },

        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/api/v1/userlist/",
                data: {
                    date_start: this.start_date,
                    date_end: this.end_date,
                    export: true,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if (res.status === "1") {
                        const data = res.data
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'UserDetails.xlsx');
                    }
                },
                error: (err) => {
                }
            })
        },

        isPageInRange(curPage, index, maxPages, pageBefore, pageAfter) {
            if (index <= 1) {
                // first 2 pages
                return true;
            }
            if (index >= maxPages - 2) {
                // last 2 pages
                return true;
            }
            if (index >= curPage - pageBefore && index <= curPage + pageAfter) {
                return true;
            }
        },


    }
    dashboardApp.init()
    document.dashboardApp = dashboardApp;

    $('#searchKey').keyup(function () {
        dashboardApp.searchKey = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    });

    $('#limit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.getData()
    });
    
})