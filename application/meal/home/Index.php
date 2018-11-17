<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/9/30
 * Time: 18:45
 */

namespace app\meal\home;


use app\index\controller\Home;
use app\user\model\User as UserModel;
use app\meal\model\Order as OrderModel ;
use think\Db;
use think\Loader;

class Index extends Home
{
    public function index(){

if(input("info")){
    phpinfo();
    exit;
}
        if(is_signin()){
            $user = session('user_auth');
            $this->assign("nickname",$user["nickname"]);
            $year = date("Y",time());
            $month = date("m",time());
            $result = Db::name("meal_order")->where(["year" => $year,'month' => $month,'uid'=>is_signin()])->field("day,id")->select();
            $this->assign('result',json_encode($result));
            return $this->fetch();
        }else{
            $this->redirect("login");
        }
    }

    public function loadmeal(){
        $year = input("year");
        $month = input("month");
        $result = Db::name("meal_order")->where(["year" => $year,'month' => $month,'uid'=>is_signin()])->field("day,id")->select();
        $this->success("ok",null,$result);
    }

    public function login(){
        if(request()->post()){
            $userModel = new UserModel();
            $userName = input("username");
            $password = input("password");
            if($userModel->login($userName,$password)){
                $this->success();
            }else{
                $this->error($userModel->getError());
            }
        }else{
            return $this->fetch();
        }
    }

    public function logout(){
        session(null);
        cookie('uid', null);
        cookie('signin_token', null);

        $this->success('OK');
    }

    public function ding(){
        $uid = is_signin();
        if($uid <= 0){
            $this->error("请登录",url("login"));
            exit;
        }
        $day = input("day");
        $month = input("month");
        $year = input("year");
        $weekday = input("weekday");


        if($year == date("Y",time()) && $month == date("m",time()) && $day == date("d",time())){
            $validate = Loader::validate("Order");
            $ap = "";
            $no=date("Hi",time());
            $lunch_begin = config("meal_config.lunch_begin")?intval(str_replace(":",'',config("meal_config.lunch_begin")))/100?:900:900;
            $lunch_end = config("meal_config.lunch_end")?intval(str_replace(":",'',config("meal_config.lunch_end")))/100?:1030:1030;
            $dinner_begin = config("meal_config.dinner_begin")?intval(str_replace(":",'',config("meal_config.dinner_begin")))/100?:1500:1500;
            $dinner_end = config("meal_config.dinner_end")?intval(str_replace(":",'',config("meal_config.dinner_end")))/100?:1630:1630;


            if ($no>$lunch_begin&&$no<$lunch_end){
                $ap = "am";
            }
            if ($no>=$dinner_begin&&$no<=$dinner_end){
                $ap = "pm";
            }
            $data = ['uid' => $uid,'day' => $day, 'month' => $month,'year' => $year,'weekday' =>$weekday,'ap' => $ap,'mealdate'=>"$year-$month-$day"];

            if(!$validate->check($data)){
                $this->error($validate->getError());
            }else{
                if(Db::name("meal_order")->where($data)->count()){
                    $this->error("已经点过了",null,-1);
                }
            }

            if(empty($ap)){
                $this->error("此时间段不能订餐");
            }
            $data["mealtime"] = time();
            $dataId = Db::name("meal_order")->insertGetId($data);
            $this->success("OK","",$dataId);
        }else{
            $this->error("这天不能订餐");
        }
    }

    public function refund(){
        $no=date("Hi",time());
        $day = input("day");
        $month = input("month");
        $year = input("year");
        if($year == date("Y",time()) && $month == date("m",time()) && $day == date("d",time())){
            $lunch_begin = config("meal_config.lunch_begin")?intval(str_replace(":",'',config("meal_config.lunch_begin")))/100?:900:900;
            $dinner_begin = config("meal_config.dinner_begin")?intval(str_replace(":",'',config("meal_config.dinner_begin")))/100?:1500:1500;
            $lunch = 1030;
            $dinner = 1630;
            if(intval(config("meal_config.quit_lunch")) > 0){
                $lunch = intval(str_replace(":",'',config("meal_config.quit_lunch")))/100;
            }
            if(intval(config("meal_config.quit_dinner")) > 0){
                $dinner = intval(str_replace(":",'',config("meal_config.quit_dinner")))/100;
            }
            if ($no>$lunch_begin&&$no<$lunch){
                $ap = "am";
            }
            if ($no>=$dinner_begin&&$no<=$dinner){
                $ap = "pm";
            }
            if(empty($ap)){
                $this->error("不能退了");
            }
            Db::name("meal_order")->where("id",input("mealId"))->delete();
            $this->success("操作成功");
        }else{
            $this->error("只能退当天的");
        }

    }
}