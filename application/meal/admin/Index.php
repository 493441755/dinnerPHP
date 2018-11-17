<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/9/30
 * Time: 18:24
 */

namespace app\meal\admin;


use app\admin\controller\Admin;
use app\common\builder\ZBuilder;
use app\user\model\User as UserModel;
use think\Db;
use think\helper\Hash;

class Index extends Admin
{
    private $_ap =[];
    public function index(){
        $currentMonthCount = Db::name("meal_order")->where("month",date("m"))->where("year",date("Y"))->count();//本月数据
        $privMonth =strtotime("first day of -1 month");
        $privMonthCount = Db::name("meal_order")->where("month",date("m",$privMonth))->where("year",date("Y",$privMonth))->count();//上月数据
        $terdayCount = Db::name("meal_order")->where("year",date("Y"))->where("month",date("m"))->where("day",date("d"))->count();//今天数据

        $yesterday = strtotime("-1 day");
        $yesterdayCount = Db::name("meal_order")->where("year",date("Y",$yesterday))->where("month",date("m",$yesterday))->where("day",date("d",$yesterday))->count();//今天数据
        $this->assign("currentMonthCount",$currentMonthCount);
        $this->assign("privMonthCount",$privMonthCount);
        $this->assign("terdayCount",$terdayCount);
        $this->assign("yesterdayCount",$yesterdayCount);
        return $this->fetch();
    }
    public function lists(){

        // 自定义按钮
        $btnExport = [
            'title'  => '导出今天',
            'icon'   => 'fa fa-list',
            'href'   => url('export')
        ];
        $where = [];
        if(input("v")){
            $where["mealdate"] = date("Y-m-d");
        }
        $this->_ap = ["am"=>'上午','pm' => '下午'];
        $result = Db::name("meal_order")
            ->where($this->getMap())
            ->where($where)
            ->view("admin_user",['nickname'],'admin_user.id = m_meal_order.uid','left')
            ->field("m_meal_order.id,m_meal_order.month,m_meal_order.day,m_meal_order.year,ap,weekday,mealtime")->paginate(50);
        return ZBuilder::make("table")->addColumns([
            ['id',"ID"],
            ['nickname',"用户名"],
            ['day','时间','callback',function($day,$data){
                return $data["year"]. "-" . $data["month"].'-'.$day ."&nbsp;&nbsp;星期".$data["weekday"];
            },'__data__'],
            ['ap','上午/下午','callback',function($ap){
                return $this->_ap[$ap];
            }],
            ['mealtime','下单时间','time']
        ])->setSearchArea([
            ['daterange','mealdate','时间段','','',['format'=>'YYYY-MM-DD','time-picker'=>'false','time_picker_24_hour'=>'true']],
            ['select','ap','上午/下午','','',['am'=>'上午','pm'=>'下午']]
        ])
            ->addTopButton("custom",$btnExport)
            ->setRowList($result)
            ->fetch();
    }

    public function export(){
        $no=date("Hi",time());
        $ap = "pm";
        if(intval($no) <1200){
            $ap = "am";
        }
        $result = Db::name("meal_order")
            ->where(['mealdate' => date("Y-m-d"),'ap'=>$ap])
            ->view("admin_user",['nickname'],'admin_user.id = m_meal_order.uid','left')
            ->field("mealdate")
            //->field("mealdate,CONCAT('星期',weekday) weekday")
            ->select();
        $objPHPExcel = new \PHPExcel();
        $sheetData = $objPHPExcel->setActiveSheetIndex(0);
        $rowIdx = 2;
        $sheetData->getCellByColumnAndRow(0, 1)->setValue("姓名");
        $sheetData->getCellByColumnAndRow(1, 1)->setValue("时间");
        foreach ($result as $row){
            $colIdx = 0;
            foreach ($row as $item){
                $sheetData->getCellByColumnAndRow($colIdx,$rowIdx )->setValue($item);
                ++$colIdx;
            }
            ++$rowIdx;
        }
        $file = time();
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="'.$file.'.xls"');
        header('Cache-Control: max-age=0');
        header("Content-Type:application/vnd.ms-excel;charset=utf-8");
        $filePath = 'php://output';
        $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');  //excel5为xls格式，excel2007为xlsx格式
        $objWriter->save($filePath);

    }

    public function editPwd(){
        if(request()->isAjax()){
            $oldPwd = input("oldpassword");
            if(empty($oldPwd)){
                $this->error("请输入旧密码");
            }else{
                if(!Hash::check((string)$oldPwd,UserModel::where("id",is_signin())->value("password"))){
                    $this->error("旧密码错误");
                }
            }
            $pwd = input("password");
            $comfirm = input("comfirm");
            if(empty($pwd)){
                $this->error("请输入新密码");
            }
            if($pwd == $comfirm){
                UserModel::update(['password' => $pwd],["id"=> is_signin()]);
                $this->error("操作成功");
            }else{
                $this->error("两次输入的密码不一致");
            }

        }else{
            return $this->fetch();
        }

    }
}