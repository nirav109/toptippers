import React from 'react';
import { Switch, Pagination, Input, Modal, PageHeader, Button, Form, Upload } from 'antd';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { getAdReports } from '../../admin/actions/adminActions';
import { ExportToCsv } from 'export-to-csv';

class Adreport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            search_string: '',
            adreportData: [],
            adreportAllData: [],
            sortValue: '',
            sortOrder: '', //asc
            visible: false,
            imageUrl: ''
        };
    }

    componentDidMount() {
        let obj = {
            search_string: this.state.search_string,
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            isAllData: false
        }
        this.props.getAdReports(obj);
        let obj_all = {
            search_string: this.state.search_string,
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            isAllData: true
        }
        this.props.getAdReports(obj_all);
    }

    searchString(e) {
        this.setState({
            search_string: e.target.value
        });
        let obj = {
            search_string: e.target.value,
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            isAllData: false
        }
        this.props.getAdReports(obj)
    }

    changePage(page, pageSize) {
        this.setState({
            currentPage: page - 1,
        });
        let obj = {
            search_string: this.state.search_string,
            page: page - 1,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            isAllData: false
        }
        this.props.getAdReports(obj)
    }

    sortData(sortVal) {
        this.setState({
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        });
        let obj = {
            search_string: this.state.search_string,
            page: this.state.currentPage,
            sortValue: sortVal,
            sortOrder: this.state.sortOrder === -1 ? 1 : -1,
            isAllData: false
        }
        this.props.getAdReports(obj)
    }

    exportToCSV() {
        const options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true, 
            showTitle: false,
            title: 'Ad Report',
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            file_name: "adreport"
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
          };
         
        const csvExporter = new ExportToCsv(options);
        if(this.state.totalRecord>5){
            let csvData = this.state.adreportAllData.map(ad=>ad._id?{...ad, addName: ad.ad.name, addType: ad.ad.type, userEmail: ad.user.email, clickTime: new Date(ad.createdAt).toLocaleString()}:ad);
            csvData.forEach(v=> {return delete v._id, delete v.createdAt, delete v.updatedAt, delete v.__v, delete v.isDeleted, delete v.user, delete v.ad});
            csvExporter.generateCsv(csvData);
        }else{
            let csvData = this.state.adreportData.map(ad=>ad._id?{...ad, addName: ad.ad.name, addType: ad.ad.type, userEmail: ad.user.email, clickTime: new Date(ad.createdAt).toLocaleString()}:ad);
            csvData.forEach(v=> {return delete v._id, delete v.createdAt, delete v.updatedAt, delete v.__v, delete v.isDeleted, delete v.user, delete v.ad});
            csvExporter.generateCsv(csvData);

        }
    }



    componentWillReceiveProps(nextProps) {
        let data = nextProps.adreportData;
        if(data.length<=5){
            this.setState({ adreportData: data, totalRecord: nextProps.totalCount, loading: false })
        }else{
            this.setState({ adreportAllData: data, loading: false })
        }
    }


    render() {
        let state = this.state;

        const adreports = state.adreportData.map((x, index) => {
                return (<tr key={index}>
                    <td>{x.ad.name}</td>
                    <td>{x.ad.type}</td>
                    <td>{x.user.name}</td>
                    <td>{x.user.email}</td>
                    <td>{new Date(x.createdAt).toLocaleString()}</td>
                </tr>)
            
        });

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="Ad Reports"
                    subTitle=""
                    extra={[
                        <Input placeholder="Search" onChange={this.searchString.bind(this)} key="search" style={{ width: 'auto' }} />,

                        <Button key="1" type="primary" onClick={this.exportToCSV.bind(this)}>Export to CSV</Button>,

                    ]}
                />
                <div className="box-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Ad Name</th>
                                <th scope="col">Ad Type</th>
                                <th scope="col">User Name</th>
                                <th scope="col">User Email</th>
                                <th scope="col">Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adreports}
                        </tbody>
                    </table>
                    <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} onChange={this.changePage.bind(this)} total={this.state.totalRecord ? this.state.totalRecord : 1} />
                </div>
            </div>
        </>
        );
    }

}

function mapStateToProps(state) {
    return {
        adreportData: state.admin.adreportData,
        totalCount: state.admin.adreportCount,

    };
}
const Adreports = Form.create({ name: 'adreport' })(Adreport);
export default connect(mapStateToProps, { getAdReports })(Adreports);

